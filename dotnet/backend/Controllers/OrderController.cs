using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EMart.Models;
using EMart.Services;
using EMart.DTOs;

namespace EMart.Controllers
{
    [Authorize]
    [ApiController]
    [Route("orders")] // Matches Java @RequestMapping("/orders")
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("place")]
        public async Task<ActionResult<Ordermaster>> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            try
            {
                var order = await _orderService.PlaceOrderFromCartAsync(request.UserId, request.CartId, request.PaymentMode);
                return Ok(order);
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = msg });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<Ordermaster>>> GetAll()
        {
            return await _orderService.GetAllOrdersAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ordermaster>> GetById(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Ordermaster>>> GetByUser(int userId)
        {
            return await _orderService.GetOrdersByUserAsync(userId);
        }
    }
}
