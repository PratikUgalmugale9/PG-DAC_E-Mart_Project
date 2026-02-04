namespace EMart.DTOs
{


    public class PaymentRequestDTO
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string? PaymentStatus { get; set; }
        public string? TransactionId { get; set; }
    }

    public class PaymentResponseDTO
    {
        public int PaymentId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string? PaymentStatus { get; set; }
        public string? TransactionId { get; set; }
        public DateTime? PaymentDate { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
    }
}
