using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EMart.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("user_id")]
        public int Id { get; set; }

        [Column("full_name")]
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Mobile { get; set; }

        [Column("password_hash")]
        public string? PasswordHash { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        [MaxLength(20)]
        public string Provider { get; set; } = "LOCAL"; // LOCAL or GOOGLE

        [JsonIgnore]
        public virtual Cart? Cart { get; set; }

        public virtual ICollection<Ordermaster> Orders { get; set; } = new List<Ordermaster>();
        public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();
        public virtual Loyaltycard? LoyaltyCard { get; set; }
    }
}
