import "./App.css";
import React, {useState, useEffect} from "react";
import {Icons} from "./assets/icons";
import {useNavigate} from "react-router-dom";

// Sample images for testing
import shirt1 from "./sampleImages/shirt_1.jpg";
import pants1 from "./sampleImages/pants_1.jpg";
import shoes1 from "./sampleImages/shoes_1.jpg";

function HomePage() {
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const imagesPerPage = 9; // 3x3 grid, 9 images per page
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        uploadImages();
    }, [images]);

    const uploadImages = async () => {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append("images", image); // Append images
        });

        try {
            const response = await fetch("http://127.0.0.1:5000/wardrobe/items", {
                method: "POST",
                body: formData,
            });
            console.log(formData)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Upload successful:", result);
        } catch (error) {
            console.error("Error uploading images:", error);
        }
    };

    const handleGenerate = async () => {
        if (images.length === 0) {
            alert("Please upload some wardrobe items first.");
            return;
        }

        setIsGenerating(true);

        try {
            const generateResponse = await fetch("http://127.0.0.1:5000/outfits/generate", {
                method: "POST",
            });

            if (!generateResponse.ok) {
                throw new Error("Failed to generate outfit.");
            }

            const outfitData = await generateResponse.json();

            setIsGenerating(false);

            // dummy outfit for testing
            const dummyOutfit = [
                {id: 1, image: shirt1},
                {id: 2, image: pants1},
                {id: 3, image: shoes1},
            ];

            // replace outfitData.outfit with dummyOutfit to test
            navigate("/generated-outfit", {state: {outfit: outfitData.outfit}});

        } catch (error) {
            console.error("Error during outfit generation:", error);
            setIsGenerating(false);
        }
    };

    const handleUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            // Store files
            setImages((prev) => [...prev, ...files]);

            // Generate preview URLs for display
            const previewUrls = files.map((file) => URL.createObjectURL(file));
            setPreviewImages((prev) => [...prev, ...previewUrls]);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const totalPages = Math.ceil(previewImages.length / imagesPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    // Calculate the images to display for the current page
    const displayedImages = previewImages.slice(
        currentPage * imagesPerPage,
        (currentPage + 1) * imagesPerPage
    );

    return (
        <div className="app-container">
            {/* Main Section */}
            <div className="main-content">
                <div className="sidebar">
                    <h1>Welcome to RunwAI</h1>
                    <h2>
                        An AI-powered styling assistant that curates outfit suggestions
                        based on your uploaded wardrobe.
                    </h2>
                    <label className="upload-btn">
                        <Icons.Upload className="upload"/> Upload
                        <input type="file" multiple onChange={handleUpload} hidden/>
                    </label>
                    <button className="generate-btn" onClick={handleGenerate} disabled={isGenerating}>
                        <Icons.Generate className="generate"/> Generate
                    </button>
                </div>

                {/* Image Grid with Arrows */}
                <div className="image-gallery">
                    <Icons.LeftArrow
                        className={`arrow ${currentPage === 0 ? "hidden" : ""}`}
                        onClick={currentPage > 0 ? handlePrevPage : null}
                    />

                    {previewImages.length === 0 ? (
                        <div className="gallery-placeholder">No images uploaded yet.</div>
                    ) : (
                        <div className="image-grid">
                            {displayedImages.map((src, index) => (
                                <div key={index} className="image-container">
                                    <img src={src} alt={`Item ${index}`}/>
                                    <button
                                        className="remove-btn"
                                        onClick={() =>
                                            removeImage(index + currentPage * imagesPerPage)
                                        }
                                    >
                                        <Icons.XButton className="x"/>
                                    </button>
                                </div>
                            ))}
                            {/* Fill empty slots with placeholders */}
                            {Array.from({
                                length: imagesPerPage - displayedImages.length,
                            }).map((_, index) => (
                                <div key={`placeholder-${index}`} className="image-placeholder"></div>
                            ))}
                        </div>
                    )}

                    <Icons.RightArrow
                        className={`arrow ${currentPage >= totalPages - 1 ? "hidden" : ""}`}
                        onClick={currentPage < totalPages - 1 ? handleNextPage : null}
                    />
                </div>
            </div>

            {/* "generating" popup */}
            {isGenerating && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <Icons.Generate className="spinner"/>
                        <p>Generating your outfit...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;