import React, { useState, useRef } from "react";
import { Container, Button, Form } from "react-bootstrap";

export default function ImageDropZone({ onImageChange }) {
    const [image, setImage] = useState(null);
    const dropRef = useRef(null);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB para permitir imagens de alta qualidade

    const processImage = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            // Imagem excede o limite de 5 MB
            alert(`Imagem muito grande! Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");

                // Preservar resolução original até um limite razoável
                const maxWidth = 1920; // Full HD como máximo
                const maxHeight = 1080; // Full HD como máximo
                
                let newWidth = img.width;
                let newHeight = img.height;
                
                // Só redimensionar se a imagem for maior que Full HD
                if (img.width > maxWidth || img.height > maxHeight) {
                    const scaleWidth = maxWidth / img.width;
                    const scaleHeight = maxHeight / img.height;
                    const scale = Math.min(scaleWidth, scaleHeight);
                    
                    newWidth = img.width * scale;
                    newHeight = img.height * scale;
                } else {
                    // Manter tamanho original se for menor que Full HD
                    newWidth = img.width;
                    newHeight = img.height;
                }

                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext("2d");
                
                // Configurações para máxima qualidade
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                // Usar PNG para preservar máxima qualidade (sem compressão)
                // ou JPEG com 95% de qualidade se o arquivo original for JPEG
                const originalFormat = file.type;
                let highQualityDataUrl;
                
                if (originalFormat === 'image/png' || originalFormat === 'image/webp') {
                    // PNG sem compressão para máxima qualidade
                    highQualityDataUrl = canvas.toDataURL("image/png");
                } else {
                    // JPEG com 95% de qualidade
                    highQualityDataUrl = canvas.toDataURL("image/jpeg", 0.95);
                }

                setImage(highQualityDataUrl);
                onImageChange?.(highQualityDataUrl);
                
                // Log para debug da qualidade
                console.log(`📸 Imagem processada: ${newWidth}x${newHeight}px, formato: ${originalFormat}, qualidade preservada!`);
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file?.type.startsWith("image/")) processImage(file);
        else console.warn("Por favor, solte uma imagem válida.");
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
        else console.warn("Por favor, selecione uma imagem válida.");
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
                    <p className="text-muted">Solte, cole ou selecione uma imagem (máx. 10 MB)<br/>
                    <small>Alta qualidade preservada - até Full HD</small></p>
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
