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
    [Route("api/cartitem")]
    public class CartItemController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartItemController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private string? UserEmail => User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.Email) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET /api/cartitem/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyCartItems()
        {
            if (UserEmail == null) return Unauthorized();
            
            var items = await _cartService.GetUserCartItemsAsync(UserEmail);
            return Ok(items);
        }

        // POST /api/cartitem/add
        [HttpPost("add")]
        public async Task<IActionResult> AddCartItem([FromBody] CartItemRequest dto)
        {
            if (UserEmail == null) return Unauthorized();
            
            try
            {
                var item = await _cartService.AddOrUpdateItemAsync(UserEmail, dto);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/cartitem/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] CartItemRequest dto)
        {
            if (UserEmail == null) return Unauthorized();
            
            try
            {
                var item = await _cartService.UpdateQuantityAsync(UserEmail, id, dto.Quantity);
                return Ok(item);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Not authorized"))
                    return StatusCode(403, new { message = ex.Message });
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/cartitem/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            if (UserEmail == null) return Unauthorized();
            
            try
            {
                var success = await _cartService.RemoveItemAsync(UserEmail, id);
                if (!success) 
                    return StatusCode(403, new { message = "Not authorized to delete this cart item" });
                
                return Ok("CartItem deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
