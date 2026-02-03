using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EMart.Models
{
    [Table("payment")]
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("payment_id")]
        public int Id { get; set; }

        [Required]
        [Column("order_id")]
        public int OrderId { get; set; }

        [ForeignKey("OrderId")]
        public virtual Ordermaster Order { get; set; } = null!;

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User User { get; set; } = null!;

        [Column("payment_date")]
        public DateTime? PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("amount_paid", TypeName = "decimal(10,2)")]
        public decimal AmountPaid { get; set; }

        [Required]
        [Column("payment_mode")]
        [MaxLength(30)]
        public string PaymentMode { get; set; } = string.Empty;

        [Required]
        [Column("payment_status")]
        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "initiated";

        [Column("transaction_id")]
        [MaxLength(100)]
        public string? TransactionId { get; set; }
    }
}
