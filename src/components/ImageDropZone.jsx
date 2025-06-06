import React, { useState, useRef } from "react";
import { Container, Button } from "react-bootstrap";

function ImageDropZone() {
    const [image, setImage] = useState(null);
    const dropRef = useRef(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB em bytes

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > MAX_FILE_SIZE) {
                alert("A imagem excede o limite de 5 MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, solte uma imagem válida.");
        }
    };

    const handlePaste = (event) => {
        const items = event.clipboardData.items;
        for (let item of items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file.size > MAX_FILE_SIZE) {
                    alert("A imagem colada excede o limite de 5 MB.");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => setImage(e.target.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > MAX_FILE_SIZE) {
                alert("A imagem selecionada excede o limite de 5 MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
        } else {
            alert("Por favor, selecione uma imagem válida.");
        }
    };

    return (
        <Container className="mt-4 text-center">
            <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onPaste={handlePaste}
                className="border border-secondary rounded d-flex align-items-center justify-content-center"
                style={{
                    width: "400px",
                    height: "420px",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    overflow: "hidden",
                    margin: "0 auto"
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <p className="text-muted">Solte, cole ou selecione uma imagem (máx. 5 MB)</p>
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-3"
                style={{ display: "block", margin: "0 auto" }}
            />
            {image && (
                <Button variant="danger" className="mt-3" onClick={() => setImage(null)}>
                    Remover Imagem
                </Button>
            )}
        </Container>
    );
}

export default ImageDropZone;