
const GITHUB_USERNAME = "NagarajDoddamani";  
const REPO_NAME = "MyArtWork_Img";  
const ACCESS_TOKEN = "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";  

const validAdmins = [
    { username: "doddamaninagaraj5", password: "Nagaraj@Laxmi@197525" },
    { username: "prabhukumar", password: "Prabhu@2005" },
    { username: "akashbelahar", password: "Akash@2005" }
];

function authenticate() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    let isValid = validAdmins.some(admin => admin.username === user && admin.password === pass);

    if (isValid) {
        Swal.fire("Login Successful!", "Welcome, Admin!", "success");
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("uploadSection").style.display = "block";
    } else {
        Swal.fire("Error!", "Invalid credentials!", "error");
    }
}

async function uploadImage() {
    let fileInput = document.getElementById("imageFile").files[0];
    let imgName = document.getElementById("imgName").value;
    let imgSize = document.getElementById("imgSize").value;
    let imgPrice = document.getElementById("imgPrice").value;
    let imgDesc = document.getElementById("imgDesc").value;

    if (!fileInput || !imgName || !imgSize || !imgPrice || !imgDesc) {
        Swal.fire("Warning!", "Please fill all fields!", "warning");
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(fileInput);
    reader.onload = async function () {
        let base64Image = reader.result.split(',')[1];

        let imagePath = `images/${fileInput.name}`;
        let metadataPath = `data.json`;

        // Upload Image
        let uploadResponse = await uploadToGitHub(imagePath, base64Image);
        if (uploadResponse) {
            // Fetch and update metadata
            let metadata = await fetchMetadata();
            metadata.push({ 
                imgName, 
                imgSize, 
                imgPrice, 
                imgDesc, 
                url: `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${imagePath}`,
                likes: 0  // Initialize likes to 0
            });
            let metadataString = JSON.stringify(metadata, null, 2);
            let uploadMetadataResponse = await uploadToGitHub(metadataPath, btoa(metadataString));

            if (uploadMetadataResponse) {
                Swal.fire("Success!", "Image & Data Uploaded!", "success");
            } else {
                Swal.fire("Error!", "Failed to update metadata!", "error");
            }
        } else {
            Swal.fire("Error!", "Image upload failed!", "error");
        }
    };
}

async function uploadToGitHub(filePath, base64Data) {
    let url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${filePath}`;

    // Step 1: Check if file already exists
    let sha = null;
    let checkResponse = await fetch(url, {
        headers: {
            "Authorization": `token ${ACCESS_TOKEN}`,
            "Accept": "application/vnd.github.v3+json"
        }
    });

    if (checkResponse.ok) {
        let existingFile = await checkResponse.json();
        sha = existingFile.sha;  // Capture SHA if file exists
    }

    // Step 2: Upload or Update the File
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `token ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Uploading image",
            content: base64Data,
            sha: sha || undefined  // Include SHA if file exists
        })
    });

    return response.ok;
}

async function fetchMetadata() {
    let url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/data.json`;
    let response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
}
