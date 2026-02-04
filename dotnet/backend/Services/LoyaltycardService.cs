using EMart.Data;
using EMart.Models;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    // Interface moved to Services/ILoyaltycardService.cs

    public class LoyaltycardService : ILoyaltycardService
    {
        private readonly EMartDbContext _context;

        public LoyaltycardService(EMartDbContext context)
        {
            _context = context;
        }

        public async Task<Loyaltycard> CreateLoyaltycardAsync(Loyaltycard loyaltycard)
        {
            var user = await _context.Users.FindAsync(loyaltycard.UserId);
            if (user == null) throw new Exception($"User not found with id {loyaltycard.UserId}");

            if (loyaltycard.PointsBalance == 0) loyaltycard.PointsBalance = 0;

            _context.Loyaltycards.Add(loyaltycard);
            await _context.SaveChangesAsync();
            return loyaltycard;
        }

        public async Task<Loyaltycard?> GetLoyaltycardByIdAsync(int id)
        {
            return await _context.Loyaltycards.FindAsync(id);
        }

        public async Task<Loyaltycard?> GetLoyaltycardByUserIdAsync(int userId)
        {
            return await _context.Loyaltycards.FirstOrDefaultAsync(l => l.UserId == userId);
        }

        public async Task<List<Loyaltycard>> GetAllLoyaltycardsAsync()
        {
            return await _context.Loyaltycards.ToListAsync();
        }

        public async Task<Loyaltycard> UpdateLoyaltycardAsync(int id, Loyaltycard loyaltycard)
        {
            var existing = await _context.Loyaltycards.FindAsync(id);
            if (existing == null) throw new Exception("Loyalty card not found");

            existing.CardNumber = loyaltycard.CardNumber;
            existing.IssuedDate = loyaltycard.IssuedDate;
            existing.ExpiryDate = loyaltycard.ExpiryDate;
            existing.IsActive = loyaltycard.IsActive;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task UpdatePointsAsync(int userId, int pointsChange)
        {
            var card = await _context.Loyaltycards.FirstOrDefaultAsync(l => l.UserId == userId);
            if (card == null) throw new Exception($"Loyalty card not found for user {userId}");

            if (card.IsActive != 'Y' && card.IsActive != 'y')
            {
                throw new Exception("Loyalty card inactive");
            }

            int currentPoints = card.PointsBalance ?? 0;
            int newBalance = currentPoints + pointsChange;

            if (newBalance < 0) throw new Exception("Insufficient loyalty points");

            card.PointsBalance = newBalance;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteLoyaltycardAsync(int id)
        {
            var card = await _context.Loyaltycards.FindAsync(id);
            if (card != null)
            {
                _context.Loyaltycards.Remove(card);
                await _context.SaveChangesAsync();
            }
        }
    }
}
