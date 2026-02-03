using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EMart.Models
{
    [Table("loyaltycard")]
    public class Loyaltycard
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("loyaltycard_Id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User User { get; set; } = null!;

        [Required]
        [Column("card_number")]
        [MaxLength(30)]
        public string CardNumber { get; set; } = string.Empty;

        [Column("points_balance")]
        public int? PointsBalance { get; set; } = 0;

        [Required]
        [Column("issued_date")]
        public DateTime IssuedDate { get; set; }

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("is_active")]
        public char? IsActive { get; set; } = 'Y';
    }
}
