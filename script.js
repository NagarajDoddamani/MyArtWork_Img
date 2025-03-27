// Store user likes in localStorage to persist likes after refresh
let userLikes = JSON.parse(localStorage.getItem("userLikes")) || {};

// Fetching data from GitHub JSON
fetch("https://raw.githubusercontent.com/NagarajDoddamani/MyArtWork_Img/main/data.json")
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data)) {
            displayImages(data);
        } else {
            console.error("Invalid JSON format");
        }
    })
    .catch(error => console.error("Error fetching data:", error));

// Function to display images
function displayImages(images) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // Clear previous content

    images.forEach((image, index) => {
        let card = document.createElement("div");
        card.classList.add("card");

        // Get stored like count for each post, default to 0
        let likeCount = userLikes[index]?.count || 0;
        let userLiked = userLikes[index]?.liked || false;

        card.innerHTML = `
            <img src="${image.url}" alt="${image.imgName}">
            <h3>${image.imgName}</h3>
            <p><strong>Size:</strong> ${image.imgSize}</p>
            <p><strong>Price:</strong> ₹${image.imgPrice}</p>
            <p>${image.imgDesc.replace(/\n/g, "<br>")}</p>
            
            <button class="btn like-btn" data-index="${index}">Like ❤️</button>
            <span class="like-count">Likes: ${likeCount}</span>
            <p class="like-message" style="color: green; display: none;"></p>

            <button class="btn share-btn" data-url="${image.url}">Share 🔗</button>
        `;

        gallery.appendChild(card);
    });

    // Add event listeners for Like & Share buttons
    document.querySelectorAll(".like-btn").forEach(button => {
        button.addEventListener("click", handleLike);
    });
    document.querySelectorAll(".share-btn").forEach(button => {
        button.addEventListener("click", handleShare);
    });
}

// Function to handle likes
function handleLike(event) {
    let index = event.target.getAttribute("data-index");
    let card = event.target.parentElement;
    let likeCountElement = card.querySelector(".like-count");
    let messageElement = card.querySelector(".like-message");

    if (!userLikes[index]) {
        userLikes[index] = { liked: false, count: 0 };
    }

    if (!userLikes[index].liked) {
        userLikes[index].liked = true;
        userLikes[index].count += 1;

        // Update UI
        event.target.classList.add("liked");
        likeCountElement.innerText = `Likes: ${userLikes[index].count}`;
        messageElement.innerText = "You have liked this post!";
        messageElement.style.color = "green";
        messageElement.style.display = "block";

        // Save to localStorage
        localStorage.setItem("userLikes", JSON.stringify(userLikes));
    } else {
        messageElement.innerText = "Only one like per user!";
        messageElement.style.color = "red";
        messageElement.style.display = "block";
    }

    // Hide the message after 3 seconds
    setTimeout(() => {
        messageElement.style.display = "none";
    }, 3000);
}

// Function to handle share button
function handleShare(event) {
    let imageUrl = event.target.getAttribute("data-url");
    let shareText = `Check out this amazing artwork: ${imageUrl}`;

    if (navigator.share) {
        navigator.share({
            title: "Art Gallery",
            text: shareText,
            url: imageUrl
        }).catch(error => console.error("Error sharing:", error));
    } else {
        prompt("Copy the link:", imageUrl);
    }
}
