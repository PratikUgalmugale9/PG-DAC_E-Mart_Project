using BCrypt.Net;
using EMart.Data;
using EMart.DTOs;
using EMart.Models;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    public interface IUserService
    {
        Task<User> RegisterAsync(User user);
        Task<User?> LoginAsync(string email, string password);
        Task<User?> LoginWithGoogleAsync(string email, string fullName);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(int id);
    }

    public class UserService : IUserService
    {
        private readonly EMartDbContext _context;
        private readonly IEmailService _emailService;

        public UserService(EMartDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<User> RegisterAsync(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                throw new Exception("Email already registered");
            }

            if (
                !string.IsNullOrEmpty(user.Mobile)
                && await _context.Users.AnyAsync(u => u.Mobile == user.Mobile)
            )
            {
                throw new Exception("Mobile number already registered");
            }

            user.Provider = "LOCAL";
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Proactive Cart Creation
            var cart = new Cart { UserId = user.Id, IsActive = 'Y' };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            // ✅ Trigger Registration Email
            await _emailService.SendRegistrationSuccessMailAsync(user);

            return user;
        }

        public async Task<User?> LoginAsync(string email, string password)
        {
            var user = await _context
                .Users.Include(u => u.Cart)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (user.Provider == "GOOGLE")
            {
                throw new Exception("Please login using Google");
            }

            if (
                string.IsNullOrEmpty(user.PasswordHash)
                || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)
            )
            {
                throw new Exception("Invalid credentials");
            }

            return user;
        }

        public async Task<User?> LoginWithGoogleAsync(string email, string fullName)
        {
            var user = await _context
                .Users.Include(u => u.Cart)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    FullName = fullName,
                    Provider = "GOOGLE",
                    PasswordHash = null,
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Proactive Cart Creation
                var cart = new Cart { UserId = user.Id, IsActive = 'Y' };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();

                // ✅ Trigger Registration Email for first-time Google user
                await _emailService.SendRegistrationSuccessMailAsync(user);

                // Refresh user to get cart
                user = await _context
                    .Users.Include(u => u.Cart)
                    .FirstOrDefaultAsync(u => u.Email == email);
            }

            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }
    }
}
