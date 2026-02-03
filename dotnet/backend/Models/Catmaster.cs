using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMart.Models
{
    [Table("catmaster")]
    public class Catmaster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("cat_master_id")]
        public int Id { get; set; }

        [Required]
        [Column("cat_id")]
        [MaxLength(10)]
        public string CatId { get; set; } = string.Empty;

        [Column("sub_cat_id")]
        [MaxLength(10)]
        public string? SubcatId { get; set; }

        [Required]
        [Column("cat_name")]
        [MaxLength(100)]
        public string CatName { get; set; } = string.Empty;

        [Column("cat_image_path")]
        public string? CatImagePath { get; set; }

        public char? Flag { get; set; } = 'N';

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
