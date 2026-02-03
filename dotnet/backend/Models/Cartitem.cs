using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EMart.Models
{
    [Table("cartitem")]
    public class Cartitem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("cart_item_id")]
        public int Id { get; set; }

        [Required]
        [Column("cart_id")]
        public int CartId { get; set; }

        [ForeignKey("CartId")]
        [JsonIgnore]
        public virtual Cart Cart { get; set; } = null!;

        [Required]
        [Column("prod_id")]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [Required]
        [Column("price_snapshot", TypeName = "decimal(10,2)")]
        public decimal PriceSnapshot { get; set; }
    }
}
