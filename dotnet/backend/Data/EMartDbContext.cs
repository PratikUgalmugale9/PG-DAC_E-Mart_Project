using Microsoft.EntityFrameworkCore;
using EMart.Models;

namespace EMart.Data
{
    public class EMartDbContext : DbContext
    {
        public EMartDbContext(DbContextOptions<EMartDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Catmaster> Catmasters { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Cartitem> Cartitems { get; set; }
        public DbSet<Ordermaster> Ordermasters { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Loyaltycard> Loyaltycards { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Unique Constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Mobile)
                .IsUnique();

            modelBuilder.Entity<Cart>()
                .HasIndex(c => c.UserId)
                .IsUnique();

            // 2. Decimal Precision (10, 2)
            foreach (var property in modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(10,2)");
            }

            // 3. Composite Key or Unique Index for OrderItem (order_id, product_id)
            modelBuilder.Entity<OrderItem>()
                .HasIndex(oi => new { oi.OrderId, oi.ProductId })
                .IsUnique();

            // 4. Default Values
            modelBuilder.Entity<User>()
                .Property(u => u.Provider)
                .HasDefaultValue("LOCAL");

            modelBuilder.Entity<Cart>()
                .Property(c => c.IsActive)
                .HasDefaultValue('Y');

            modelBuilder.Entity<Ordermaster>()
                .Property(o => o.OrderStatus)
                .HasDefaultValue("Pending");

            modelBuilder.Entity<Payment>()
                .Property(p => p.PaymentStatus)
                .HasDefaultValue("initiated");

            // 5. Relationships Configuration (Fluent API)
            
            // User -> Cart (One-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Cart)
                .WithOne(c => c.User)
                .HasForeignKey<Cart>(c => c.UserId);

            // User -> LoyaltyCard (One-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.LoyaltyCard)
                .WithOne(l => l.User)
                .HasForeignKey<Loyaltycard>(l => l.UserId);

            // Catmaster -> Product (One-to-Many)
            modelBuilder.Entity<Catmaster>()
                .HasMany(c => c.Products)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryId);

            // Ordermaster -> OrderItem (One-to-Many)
            modelBuilder.Entity<Ordermaster>()
                .HasMany(o => o.Items)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId);
        }
    }
}
