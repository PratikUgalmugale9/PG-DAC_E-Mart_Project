using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMart.Data;
using EMart.Models;
using EMart.DTOs;
using EMart.Helpers;
using EMart.Services;

namespace EMart.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly EMartDbContext _context;
        private readonly IJwtTokenService _jwtService;

        public AuthController(EMartDbContext context, IJwtTokenService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                Mobile = request.Mobile,
                Address = request.Address,
                Provider = "LOCAL"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create cart for new user
            var cart = new Cart { UserId = user.Id };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || user.PasswordHash == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse(
                user.Id,
                user.FullName,
                user.Email,
                token,
                user.Provider
            ));
        }
    }
}
