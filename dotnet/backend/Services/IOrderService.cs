using EMart.Models;

namespace EMart.Services
{


     public interface IOrderService
    {
        Task<Ordermaster> PlaceOrderFromCartAsync(int userId, int? cartId, string paymentMode);
        Task<List<Ordermaster>> GetAllOrdersAsync();
        Task<Ordermaster?> GetOrderByIdAsync(int id);
        Task<List<Ordermaster>> GetOrdersByUserAsync(int userId);
    }
}
