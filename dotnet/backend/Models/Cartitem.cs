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
        [Column("CartItem_Id")]
        public int Id { get; set; }

        [Required]
        [Column("Cart_Id")]
        public int CartId { get; set; }

        [ForeignKey("CartId")]
        [JsonIgnore]
        public virtual Cart Cart { get; set; } = null!;

        [Required]
        [Column("Prod_Id")]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal PriceSnapshot { get; set; }
    }
}
