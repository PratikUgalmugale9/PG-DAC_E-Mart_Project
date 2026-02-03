using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMart.Data;

namespace EMart.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DbTestController : ControllerBase
    {
        private readonly EMartDbContext _context;

        public DbTestController(EMartDbContext context)
        {
            _context = context;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                // Try to connect and check if we can reach the database
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    return StatusCode(500, new { status = "Error", message = "Could not connect to database." });
                }

                // Try to fetch counts to verify mapping
                var userCount = await _context.Users.CountAsync();
                var productCount = await _context.Products.CountAsync();
                var categoryCount = await _context.Catmasters.CountAsync();

                return Ok(new
                {
                    status = "Success",
                    message = "Successfully connected to 'emart' database.",
                    data = new
                    {
                        totalUsers = userCount,
                        totalProducts = productCount,
                        totalCategories = categoryCount
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "Error", message = ex.Message, detail = ex.InnerException?.Message });
            }
        }
    }
}
