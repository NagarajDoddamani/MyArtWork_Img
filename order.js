
// Show/Hide Post Address Field Based on Delivery Type
document.getElementById("deliveryType").addEventListener("change", function() {
    let postAddressField = document.getElementById("postAddressField");
    postAddressField.style.display = (this.value === "by post") ? "block" : "none";
});

// Form Submission with SweetAlert Popup
document.getElementById("emailForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Stop default form submission
    
    let form = this;
    let formData = new FormData(form);

    fetch(form.action, {
        method: "POST",
        body: formData,
    })
    .finally(() => { 
        Swal.fire("Success!", "Your message and image have been sent!", "success");
        form.reset(); // Clear form on success
        document.getElementById("postAddressField").style.display = "none"; // Hide post address field
    });
});

