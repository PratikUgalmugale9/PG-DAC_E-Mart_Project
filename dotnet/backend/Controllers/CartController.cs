using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EMart.Data;
using EMart.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMart.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/cart")] // Matches Java @RequestMapping("/api/cart")
    public class CartController : ControllerBase    
    {
        private readonly EMartDbContext _context;

        public CartController(EMartDbContext context)
        {
            _context = context;
        }

        private string? UserEmail => User.FindFirst(ClaimTypes.Name)?.Value 
                                     ?? User.FindFirst("sub")?.Value 
                                     ?? User.Identity?.Name;

        // CREATE cart for logged-in user
        [HttpPost("create")]
        public async Task<ActionResult<Cart>> CreateCart()
        {
            if (UserEmail == null) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == UserEmail);
            if (user == null) return NotFound("User not found");

            if (await _context.Carts.AnyAsync(c => c.UserId == user.Id))
            {
                return BadRequest("Cart already exists");
            }

            var cart = new Cart
            {
                UserId = user.Id,
                IsActive = 'Y'
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return Ok(cart);
        }

        // GET logged-in user's cart
        [HttpGet("my")]
        public async Task<ActionResult<Cart>> GetMyCart()
        {
            if (UserEmail == null) return Unauthorized();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.User.Email == UserEmail);

            if (cart == null) return NotFound("Cart not found");

            return Ok(cart);
        }

        // UPDATE logged-in user's cart
        [HttpPut("update")]
        public async Task<ActionResult<Cart>> UpdateMyCart([FromBody] Cart updatedCart)
        {
            if (UserEmail == null) return Unauthorized();

            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.User.Email == UserEmail);

            if (cart == null) return NotFound("Cart not found");

            cart.IsActive = updatedCart.IsActive;

            await _context.SaveChangesAsync();

            return Ok(cart);
        }

        // DELETE logged-in user's cart
        [HttpDelete("delete")]
        public async Task<ActionResult<string>> DeleteMyCart()
        {
            if (UserEmail == null) return Unauthorized();

            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.User.Email == UserEmail);

            if (cart == null) return NotFound("Cart not found");

            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync();

            return Ok("Cart deleted successfully");
        }
    }
}
