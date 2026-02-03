using EMart.Services;
using Microsoft.AspNetCore.Mvc;

namespace EMart.Controllers
{
    [ApiController]
    [Route("api/catalog")]
    public class CatalogController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CatalogController(ICategoryService service)
        {
            _service = service;
        }

        // GET: /api/catalog/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetMainCategories()
        {
            var result = await _service.GetMainCategoriesAsync();
            return Ok(result);
        }

        // GET: /api/catalog/categories/{catId}
        [HttpGet("categories/{catId}")]
        public async Task<IActionResult> BrowseCategory(string catId)
        {
            var result = await _service.BrowseByCategoryAsync(catId);
            return Ok(result);
        }
    
    }
}
