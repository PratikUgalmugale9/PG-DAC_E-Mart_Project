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
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect) return StatusCode(500, new { status = "Error", message = "Could not connect" });

                return Ok(new
                {
                    totalUsers = await _context.Users.CountAsync(),
                    totalProducts = await _context.Products.CountAsync(),
                    totalCategories = await _context.Catmasters.CountAsync()
                });
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("inspect")]
        public async Task<IActionResult> InspectData()
        {
            try
            {
                var categories = await _context.Catmasters
                    .Take(5)
                    .Select(c => new { c.Id, c.CatId, c.CatName })
                    .ToListAsync();

                var products = await _context.Products
                    .Take(5)
                    .Select(p => new { p.Id, p.ProdName, p.CategoryId })
                    .ToListAsync();

                // Raw SQL to inspect actual column names
                var cartItemColumns = new List<string>();
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = "SHOW COLUMNS FROM cartitem";
                    _context.Database.OpenConnection();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            cartItemColumns.Add(reader.GetString(0)); // Field name
                        }
                    }
                }

                return Ok(new { categories, products, cartItemColumns });
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
