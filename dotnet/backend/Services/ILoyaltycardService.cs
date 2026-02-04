using EMart.Models;

namespace EMart.Services
{


     public interface ILoyaltycardService
    {
        Task<Loyaltycard> CreateLoyaltycardAsync(Loyaltycard loyaltycard);
        Task<Loyaltycard?> GetLoyaltycardByIdAsync(int id);
        Task<Loyaltycard?> GetLoyaltycardByUserIdAsync(int userId);
        Task<List<Loyaltycard>> GetAllLoyaltycardsAsync();
        Task<Loyaltycard> UpdateLoyaltycardAsync(int id, Loyaltycard loyaltycard);
        Task UpdatePointsAsync(int userId, int pointsChange);
        Task DeleteLoyaltycardAsync(int id);
    }
}
