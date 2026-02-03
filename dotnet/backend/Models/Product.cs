using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EMart.Models
{
    [Table("product")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("prod_id")]
        public int Id { get; set; }

        [Required]
        [Column("cat_master_id")]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Catmaster Category { get; set; } = null!;

        [Required]
        [Column("prod_name")]
        [MaxLength(150)]
        public string ProdName { get; set; } = string.Empty;

        [Column("prod_image_path")]
        [MaxLength(255)]
        public string? ProdImagePath { get; set; }

        [Column("prod_short_desc")]
        [MaxLength(255)]
        public string? ProdShortDesc { get; set; }

        [Column("prod_long_desc", TypeName = "TEXT")]
        public string? ProdLongDesc { get; set; }

        [Column("mrp_price", TypeName = "decimal(10,2)")]
        public decimal? MrpPrice { get; set; }

        [Column("cardholder_price", TypeName = "decimal(10,2)")]
        public decimal? CardholderPrice { get; set; }

        [Column("points_2b_redeem")]
        public int? PointsToBeRedeem { get; set; }

        [JsonIgnore]
        public virtual ICollection<Cartitem> CartItems { get; set; } = new List<Cartitem>();

        [JsonIgnore]
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
