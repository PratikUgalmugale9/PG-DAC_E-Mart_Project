using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EMart.Models
{
    [Table("ordermaster")]
    public class Ordermaster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("order_id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User User { get; set; } = null!;

        [Column("order_date")]
        public DateTime? OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column("order_status")]
        [MaxLength(30)]
        public string OrderStatus { get; set; } = "Pending";

        [Column("payment_mode")]
        [MaxLength(30)]
        public string? PaymentMode { get; set; }

        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
