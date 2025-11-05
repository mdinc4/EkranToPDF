import React, { useState, useEffect, useRef } from 'react';

// Kütüphane Notu:
// jsPDF, tarayıcı tabanlı bir kütüphane olduğu için
// bu tekil React dosyasında, bir CDN script etiketi ile
// HTML body içinde zaten yüklenmiş kabul edilir.

// Yükleme ve Durum Modalları için Bileşenler
const LoadingModal = ({ isVisible }) => (
    <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
        <div className="bg-indigo-600 text-white rounded-xl shadow-2xl p-8 flex flex-col items-center">
            <div className="spinner mb-4 border-4 border-white/30 border-t-white rounded-full w-10 h-10 animate-spin"></div>
            <p className="text-lg font-semibold">PDF Oluşturuluyor...</p>
            <p className="text-sm mt-2">Lütfen işlem tamamlanana kadar bekleyin.</p>
        </div>
    </div>
);

const StatusModal = ({ status, hideModal }) => {
    if (!status.isVisible) return null;

    const isError = status.type === 'error';
    const titleClass = isError ? 'text-red-600' : 'text-green-600';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={hideModal}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm" 
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={`text-2xl font-bold mb-3 ${titleClass}`}>{status.title}</h3>
                <p className="text-gray-700 mb-6">{status.message}</p>
                <button 
                    onClick={hideModal} 
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Kapat
                </button>
            </div>
        </div>
    );
};

// Base64 okuma işlemini Promise ile saran yardımcı fonksiyon
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const App = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ isVisible: false, title: '', message: '', type: '' });

    // Global değişkenleri React bileşeni içinde tanımlıyoruz (Zorunlu Canvas Kuralı)
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

    // Dosya seçme event'ı
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        setSelectedFiles(files);
    };

    // Durum modalını gizle
    const hideStatusModal = () => {
        setStatus(prev => ({ ...prev, isVisible: false }));
    };

    // PDF Oluşturma Fonksiyonu
    const generatePdf = async () => {
        if (selectedFiles.length === 0) {
            setStatus({ 
                isVisible: true, 
                title: 'Uyarı', 
                message: 'Lütfen önce PDF oluşturmak istediğiniz görselleri seçin.', 
                type: 'error' 
            });
            return;
        }

        setIsLoading(true);
        try {
            // jspdf kütüphanesini window nesnesinden alıyoruz (CDN ile yüklü varsayılır)
            const { jsPDF } = window;
            
            const a4Width = 210;
            const a4Height = 297;

            let doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            let isFirstPage = true;

            for (const file of selectedFiles) {
                if (!file.type.startsWith('image/')) continue;
                
                if (!isFirstPage) {
                    doc.addPage();
                } else {
                    isFirstPage = false;
                }

                const base64Image = await readFileAsBase64(file);
                const imgType = file.type.split('/')[1];

                const img = new Image();
                await new Promise(resolve => {
                    img.onload = resolve;
                    img.src = base64Image;
                });
                
                const imgWidth = img.width;
                const imgHeight = img.height;

                const margin = 10; 
                const usableWidth = a4Width - 2 * margin;
                const usableHeight = a4Height - 2 * margin;

                let ratio = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
                
                let targetWidth = imgWidth * ratio;
                let targetHeight = imgHeight * ratio;

                const x = (a4Width - targetWidth) / 2;
                const y = (a4Height - targetHeight) / 2;

                doc.addImage(
                    base64Image, 
                    imgType.toUpperCase(), 
                    x, 
                    y, 
                    targetWidth, 
                    targetHeight, 
                    null, 
                    'FAST'
                );
            }

            doc.save('gorsellerden_pdf.pdf');
            
            setStatus({ 
                isVisible: true, 
                title: 'Başarılı', 
                message: `${selectedFiles.length} görselden oluşan PDF başarıyla oluşturuldu ve cihazınıza kaydedildi.`, 
                type: 'success' 
            });

        } catch (error) {
            console.error('PDF oluşturulurken bir hata oluştu:', error);
            setStatus({ 
                isVisible: true, 
                title: 'Hata', 
                message: `PDF oluşturulurken beklenmedik bir hata oluştu: ${error.message}. Lütfen konsolu kontrol edin.`, 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-0 sm:p-4 flex flex-col items-center font-inter">
            <div className="w-full max-w-lg mx-auto bg-white shadow-lg sm:rounded-xl p-4 md:p-6 mt-0 sm:mt-8 min-h-screen sm:min-h-0">
                
                <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">Mobil PDF Dönüştürücü</h1>
                <p className="text-gray-600 mb-8">PDF oluşturmak için görselleri seçin. Her görsel yeni bir sayfaya yerleştirilecektir.</p>

                {/* Dosya Seçme Alanı */}
                <div className="mb-10">
                    <label htmlFor="fileInput" className="block text-lg font-medium text-gray-700 mb-2">Görsel Dosyaları</label>
                    <input 
                        type="file" 
                        id="fileInput" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-4 
                                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                                file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition"
                    />
                </div>

                {/* Seçilen Görsellerin Önizleme Alanı */}
                <div className="mb-8">
                    <h2 
                        className={`text-xl font-semibold text-gray-700 mb-4 ${selectedFiles.length === 0 ? 'hidden' : ''}`}
                    >
                        Seçilen Görseller
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-4 border border-dashed border-gray-300 rounded-lg min-h-24 bg-gray-50">
                        {selectedFiles.length === 0 ? (
                            <p className="col-span-full text-center text-gray-400 italic py-6">Henüz görsel seçilmedi.</p>
                        ) : (
                            selectedFiles.map((file, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden shadow-md">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={file.name} 
                                        className="w-full h-full object-cover transition-transform duration-300"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-50 text-white text-xs text-center truncate">
                                        {file.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Ana İşlem Butonu */}
                <div className="mt-8 pb-4">
                    <button 
                        onClick={generatePdf} 
                        disabled={selectedFiles.length === 0 || isLoading} 
                        className="w-full px-6 py-4 text-xl font-bold text-white bg-indigo-600 rounded-xl shadow-lg 
                                hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {isLoading ? 'Oluşturuluyor...' : `PDF Oluştur ve İndir (${selectedFiles.length} Görsel)`}
                    </button>
                </div>
            </div>

            {/* Modallar */}
            <LoadingModal isVisible={isLoading} />
            <StatusModal status={status} hideModal={hideStatusModal} />
        </div>
    );
};

export default App;
// Kütüphane gereksinimleri:
// 1. React (Zaten varsayılan olarak mevcut)
// 2. jsPDF (CDN üzerinden HTML'e eklenmelidir: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)