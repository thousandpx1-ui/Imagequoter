export default function Contact() {
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Contact Us</h2>

      <p>If you have any questions or issues, feel free to contact us.</p>

      <div style={{ marginTop: "20px" }}>
        <p><strong>Email:</strong> thousandpx1@gmail.com</p>
        <p><strong>Phone:</strong> +91 7306119808</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Message sent! (You can connect backend later)");
        }}
        style={{ marginTop: "20px" }}
      >
        <input
          type="text"
          placeholder="Your Name"
          required
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Your Email"
          required
          style={inputStyle}
        />

        <textarea
          placeholder="Your Message"
          required
          style={{ ...inputStyle, height: "100px" }}
        />

        <button type="submit" style={buttonStyle}>
          Send Message
        </button>
      </form>
    </div>
  );
}

// 🔹 Simple styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px",
  width: "100%",
  backgroundColor: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};