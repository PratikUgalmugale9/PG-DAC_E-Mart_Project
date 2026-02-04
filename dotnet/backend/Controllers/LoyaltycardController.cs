using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EMart.Models;
using EMart.Services;
using EMart.Data;
using Microsoft.EntityFrameworkCore;

namespace EMart.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LoyaltycardController : ControllerBase
    {
        private readonly ILoyaltycardService _loyaltycardService;
        private readonly EMartDbContext _context;

        public LoyaltycardController(ILoyaltycardService loyaltycardService, EMartDbContext context)
        {
            _loyaltycardService = loyaltycardService;
            _context = context;
        }

        private string? UserEmail => User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value 
                                     ?? User.FindFirst("sub")?.Value 
                                     ?? User.Identity?.Name;

        // ===================== GET MY CARD =====================
        [HttpGet("my")]
        public async Task<ActionResult<Loyaltycard>> GetMyCard()
        {
            if (string.IsNullOrEmpty(UserEmail)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == UserEmail);
            if (user == null) return NotFound("User not found");

            var card = await _loyaltycardService.GetLoyaltycardByUserIdAsync(user.Id);
            return Ok(card);
        }

        // ===================== SIGNUP (Create for logged-in user) =====================
        [HttpPost("signup")]
        public async Task<ActionResult<Loyaltycard>> Signup()
        {
            try
            {
                if (string.IsNullOrEmpty(UserEmail)) return Unauthorized();

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == UserEmail);
                if (user == null) return NotFound(new { message = "User not found" });

                // Check if user already has a card
                var existingCard = await _loyaltycardService.GetLoyaltycardByUserIdAsync(user.Id);
                if (existingCard != null) return BadRequest(new { message = "You already have a loyalty card" });

                // Create new card with server-generated values
                var newCard = new Loyaltycard
                {
                    UserId = user.Id,
                    CardNumber = $"EMART-{user.Id}-{DateTime.UtcNow.Ticks.ToString("X")}",
                    PointsBalance = 100, // Welcome bonus
                    IssuedDate = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddYears(1),
                    IsActive = 'Y'
                };

                var created = await _loyaltycardService.CreateLoyaltycardAsync(newCard);
                return Ok(created);
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = msg });
            }
        }

        // ===================== CREATE =====================
        [HttpPost]
        public async Task<ActionResult<Loyaltycard>> Create([FromBody] Loyaltycard loyaltycard)
        {
            try
            {
                var created = await _loyaltycardService.CreateLoyaltycardAsync(loyaltycard);
                return Ok(created);
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = msg });
            }
        }

        // ===================== READ BY ID =====================
        [HttpGet("{id}")]
        public async Task<ActionResult<Loyaltycard>> GetById(int id)
        {
            var card = await _loyaltycardService.GetLoyaltycardByIdAsync(id);
            if (card == null) return NotFound();
            return Ok(card);
        }

        // ===================== READ BY USER ID =====================
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<Loyaltycard>> GetByUserId(int userId)
        {
            var card = await _loyaltycardService.GetLoyaltycardByUserIdAsync(userId);
            if (card == null) return NotFound();
            return Ok(card);
        }

        // ===================== READ ALL =====================
        [HttpGet]
        public async Task<ActionResult<List<Loyaltycard>>> GetAll()
        {
            return await _loyaltycardService.GetAllLoyaltycardsAsync();
        }

        // ===================== UPDATE CARD DETAILS =====================
        [HttpPut("{id}")]
        public async Task<ActionResult<Loyaltycard>> Update(int id, [FromBody] Loyaltycard loyaltycard)
        {
            try
            {
                var updated = await _loyaltycardService.UpdateLoyaltycardAsync(id, loyaltycard);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ===================== DELETE =====================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _loyaltycardService.DeleteLoyaltycardAsync(id);
            return NoContent();
        }
    }
}
