using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using EMart.DTOs;
using EMart.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMart.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private string? UserEmail => User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet("my")]
        public async Task<IActionResult> GetMyCart()
        {
            if (UserEmail == null) return Unauthorized();
            var cart = await _cartService.GetUserCartAsync(UserEmail);
            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddItem([FromBody] CartItemRequest request)
        {
            if (UserEmail == null) return Unauthorized();
            try
            {
                var item = await _cartService.AddOrUpdateItemAsync(UserEmail, request);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] int quantity)
        {
            if (UserEmail == null) return Unauthorized();
            try
            {
                var item = await _cartService.UpdateQuantityAsync(UserEmail, id, quantity);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> RemoveItem(int id)
        {
            if (UserEmail == null) return Unauthorized();
            var success = await _cartService.RemoveItemAsync(UserEmail, id);
            if (!success) return NotFound(new { message = "Item not found or not authorized" });
            return Ok(new { message = "Item removed successfully" });
        }
    }
}
