import React, { useState, useRef } from "react";
import { Container, Button, Form } from "react-bootstrap";

export default function ImageDropZone({ onImageChange }) {
    const [image, setImage] = useState(null);
    const dropRef = useRef(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const processImage = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            alert("A imagem excede o limite de 5 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");

                const maxWidth = 100; // limite de largura
                const scale = maxWidth / img.width;
                const newWidth = maxWidth;
                const newHeight = img.height * scale;

                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                // Qualidade 0.2 (20%)
                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.2);

                setImage(compressedDataUrl);
                onImageChange?.(compressedDataUrl);
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file?.type.startsWith("image/")) processImage(file);
        else alert("Por favor, solte uma imagem válida.");
    };

    const handlePaste = (event) => {
        for (let item of event.clipboardData.items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) processImage(file);
            }
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file?.type.startsWith("image/")) processImage(file);
        else alert("Por favor, selecione uma imagem válida.");
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
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
            />
            {image && (
                <Button variant="danger" className="mt-3" onClick={() => {
                    setImage(null);
                    onImageChange?.(null);
                }}>
                    Remover Imagem
                </Button>
            )}
            <Form.Group controlId="legend" className="mt-3">
                <Form.Control as="textarea" rows={1} name="observacao" placeholder="Legenda da Imagem" />
            </Form.Group>
        </Container>
    );
}
