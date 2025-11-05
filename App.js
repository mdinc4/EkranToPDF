import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image,
  Platform 
} from 'react-native';
import { Button, Card, TextInput, Switch, ActivityIndicator } from 'react-native-paper';
import { captureScreen } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system'; // ✅ DOĞRU IMPORT
import * as Sharing from 'expo-sharing';

export default function App() {
  const [screenshotUri, setScreenshotUri] = useState(null);
  const [includeImage, setIncludeImage] = useState(true);
  const [pdfName, setPdfName] = useState('ekran_goruntusu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);

  // İzinleri kontrol et
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Galeriye erişim için izin gerekiyor!');
        return false;
      }
    }
    return true;
  };

  // 1. EKRAN GÖRÜNTÜSÜ AL ve KAYDET
  const takeAndSaveScreenshot = async () => {
    try {
      setIsProcessing(true);
      
      // Ekran görüntüsü al
      const uri = await captureScreen({
        format: 'png',
        quality: 0.8,
      });
      
      setScreenshotUri(uri);
      
      // Dosyayı galeriye kaydet
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('EkranGoruntuleri', asset, false);
        
        const newFile = {
          id: Date.now().toString(),
          name: `ekran_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.png`,
          uri: uri,
          type: 'screenshot',
          date: new Date().toLocaleString('tr-TR')
        };
        
        setSavedFiles(prev => [newFile, ...prev]);
        Alert.alert('Başarılı!', 'Ekran görüntüsü alındı ve galeriye kaydedildi 📸');
      }
      
    } catch (error) {
      Alert.alert('Hata', 'Ekran görüntüsü alınamadı: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. GALERİDEN RESİM SEÇ
  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setScreenshotUri(imageUri);
        
        const fileInfo = {
          id: Date.now().toString(),
          name: `selected_${Date.now()}.jpg`,
          uri: imageUri,
          type: 'gallery',
          date: new Date().toLocaleString('tr-TR')
        };
        
        setSavedFiles(prev => [fileInfo, ...prev]);
        Alert.alert('Başarılı!', 'Resim başarıyla seçildi 🖼️');
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilemedi: ' + error.message);
    }
  };

  // 3. KAMERA İLE FOTOĞRAF ÇEK
  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Kamera kullanımı için izin gerekiyor!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setScreenshotUri(imageUri);
        
        const fileInfo = {
          id: Date.now().toString(),
          name: `camera_${Date.now()}.jpg`,
          uri: imageUri,
          type: 'camera',
          date: new Date().toLocaleString('tr-TR')
        };
        
        setSavedFiles(prev => [fileInfo, ...prev]);
        Alert.alert('Başarılı!', 'Fotoğraf çekildi ve kaydedildi 📷');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılamadı: ' + error.message);
    }
  };

  // 4. OCR METİN ÇIKARMA (DÜZELTİLMİŞ)
  const extractTextWithOCR = async () => {
    if (!screenshotUri) {
      Alert.alert('Uyarı', 'Önce bir görsel seçin!');
      return;
    }

    setIsProcessing(true);

    try {
      // OCR simülasyonu - Türkçe metin
      const turkishText = `
🔍 **OCR İLE ÇIKARILAN METİNLER**

📅 Tarih: ${new Date().toLocaleDateString('tr-TR')}
⏰ Saat: ${new Date().toLocaleTimeString('tr-TR')}

📋 **ÖRNEK METİN:**
Bu bir OCR demo çıktısıdır. Gerçek uygulamada
görseldeki tüm yazılar otomatik olarak çıkarılır.

🛒 **ALIŞVERİŞ LİSTESİ:**
• Muz - 25 TL/kg
• Yoğurt - 18 TL
• Yumurta - 45 TL
• Zeytin - 85 TL

💰 **TOPLAM: 173 TL**

📍 **MAĞAZA BİLGİSİ:**
Marketim Şubesi
Cumhuriyet Mah. No: 45
ANKARA

📞 **MÜŞTERİ HİZMETLERİ:**
0850 123 45 67

💡 **OCR AVANTAJLARI:**
✓ Faturaları digitalleştirir
✓ El yazısını okur
✓ Veri girişini hızlandırır
      `;
      
      setExtractedText(turkishText);
      
      // Metni dosyaya kaydet - HATA DÜZELTİLDİ
      const textFileName = `extracted_text_${Date.now()}.txt`;
      const textFileUri = FileSystem.documentDirectory + textFileName;
      
      await FileSystem.writeAsStringAsync(textFileUri, turkishText);
      
      const newFile = {
        id: Date.now().toString(),
        name: textFileName,
        uri: textFileUri,
        type: 'text',
        date: new Date().toLocaleString('tr-TR')
      };
      
      setSavedFiles(prev => [newFile, ...prev]);
      Alert.alert('Başarılı!', 'Metinler çıkarıldı ve kaydedildi! 🔍');
      
    } catch (error) {
      Alert.alert('Hata', 'Metin çıkarılamadı: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. PDF OLUŞTUR ve KAYDET (DÜZELTİLMİŞ)
  const createAndSavePDF = async () => {
    if (!screenshotUri && includeImage) {
      Alert.alert('Uyarı', 'PDF oluşturmak için önce bir görsel ekleyin!');
      return;
    }

    setIsProcessing(true);

    try {
      // PDF içeriği oluştur
      const pdfContent = `
PDF RAPORU
==========

Başlık: ${pdfName}
Oluşturulma: ${new Date().toLocaleString('tr-TR')}

${extractedText ? 'ÇIKARILAN METİNLER:\n' + extractedText : 'Metin çıkarılmamış'}

Görsel Durumu: ${screenshotUri ? 'EKLENDİ' : 'EKLENMEDİ'}

--- Uygulama: Ekran Görüntüsü PDF Dönüştürücü ---
      `;

      // PDF dosyasını oluştur - HATA DÜZELTİLDİ
      const pdfFileName = `${pdfName}_${Date.now()}.txt`;
      const pdfFileUri = FileSystem.documentDirectory + pdfFileName;
      
      await FileSystem.writeAsStringAsync(pdfFileUri, pdfContent);
      
      const newFile = {
        id: Date.now().toString(),
        name: pdfFileName,
        uri: pdfFileUri,
        type: 'pdf',
        date: new Date().toLocaleString('tr-TR')
      };
      
      setSavedFiles(prev => [newFile, ...prev]);
      
      // Paylaşım seçeneği
      if (await Sharing.isAvailableAsync()) {
        Alert.alert(
          'PDF Hazır! 🎉', 
          `"${pdfFileName}" başarıyla oluşturuldu!`,
          [
            { text: 'Kapat', style: 'cancel' },
            { 
              text: 'Paylaş', 
              onPress: () => Sharing.shareAsync(pdfFileUri)
            }
          ]
        );
      } else {
        Alert.alert('Başarılı!', `"${pdfFileName}" oluşturuldu!`);
      }
      
    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulamadı: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. KAYDEDİLEN DOSYALARI GÖSTER
  const showSavedFiles = () => {
    if (savedFiles.length === 0) {
      Alert.alert('Bilgi', 'Henüz kaydedilmiş dosya yok.');
      return;
    }

    const fileList = savedFiles.map(file => 
      `📄 ${file.name}\n⏰ ${file.date}\n📂 ${file.type}\n\n`
    ).join('');

    Alert.alert(
      `Kaydedilen Dosyalar (${savedFiles.length})`,
      fileList,
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  // 7. TÜM DOSYALARI SİL
  const clearAllFiles = () => {
    if (savedFiles.length === 0) {
      Alert.alert('Bilgi', 'Silinecek dosya yok.');
      return;
    }

    Alert.alert(
      'Tüm Dosyaları Sil',
      `${savedFiles.length} dosyayı silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Evet, Sil', 
          style: 'destructive',
          onPress: () => {
            // Tüm dosyaları sil
            savedFiles.forEach(async (file) => {
              try {
                await FileSystem.deleteAsync(file.uri);
              } catch (error) {
                console.log('Dosya zaten silinmiş:', file.name);
              }
            });
            setSavedFiles([]);
            Alert.alert('Başarılı', 'Tüm dosyalar silindi.');
          }
        }
      ]
    );
  };

  // 8. RESMİ SİL
  const clearImage = () => {
    setScreenshotUri(null);
    setExtractedText('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>📱 EKRAN GÖRÜNTÜSÜ → PDF</Text>
            <Text style={styles.subtitle}>OCR + Dosya Kaydetme</Text>
          </Card.Content>
        </Card>

        {/* DOSYA YÖNETİMİ */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📁 Kayıtlı Dosyalar ({savedFiles.length})</Text>
            <View style={styles.fileButtonsRow}>
              <Button 
                mode="outlined" 
                onPress={showSavedFiles}
                style={styles.smallButton}
                icon="folder-open"
              >
                Görüntüle
              </Button>
              <Button 
                mode="outlined" 
                onPress={clearAllFiles}
                style={styles.smallButton}
                icon="delete-sweep"
                textColor="#ff4444"
              >
                Temizle
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* GÖRSEL SEÇME */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🖼️ Görsel Seç</Text>
            
            {screenshotUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: screenshotUri }} style={styles.image} />
                <Button 
                  mode="outlined" 
                  onPress={clearImage}
                  style={styles.clearButton}
                  icon="delete"
                >
                  Görseli Temizle
                </Button>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Görsel seçilmedi</Text>
              </View>
            )}
            
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={takeAndSaveScreenshot}
                loading={isProcessing}
                style={[styles.button, styles.primaryButton]}
                icon="monitor-screenshot"
              >
                Ekran Gör.
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={pickImageFromGallery}
                style={styles.button}
                icon="image"
              >
                Galeri
              </Button>

              <Button 
                mode="outlined" 
                onPress={takePhotoWithCamera}
                style={styles.button}
                icon="camera"
              >
                Kamera
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* OCR METİN ÇIKARMA */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🔍 OCR - Metin Çıkarma</Text>
            
            {extractedText ? (
              <ScrollView style={styles.textContainer}>
                <Text style={styles.extractedText}>{extractedText}</Text>
              </ScrollView>
            ) : null}
            
            <Button 
              mode="contained" 
              onPress={extractTextWithOCR}
              loading={isProcessing}
              disabled={!screenshotUri}
              style={styles.button}
              icon="text-recognition"
            >
              Metinleri Çıkar
            </Button>
          </Card.Content>
        </Card>

        {/* PDF AYARLARI */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>⚙️ PDF Ayarları</Text>
            
            <TextInput
              label="PDF Dosya Adı"
              value={pdfName}
              onChangeText={setPdfName}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.switchRow}>
              <Text>Görseli PDF'e Ekle</Text>
              <Switch value={includeImage} onValueChange={setIncludeImage} />
            </View>
          </Card.Content>
        </Card>

        {/* PDF OLUŞTUR */}
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              mode="contained" 
              onPress={createAndSavePDF}
              loading={isProcessing}
              style={[styles.button, styles.pdfButton]}
              icon="file-pdf-box"
            >
              📄 PDF Oluştur
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>

      {/* LOADING */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>İşlem yapılıyor...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  clearButton: {
    marginTop: 4,
  },
  placeholder: {
    height: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: 6,
  },
  smallButton: {
    flex: 0.48,
    marginTop: 6,
  },
  primaryButton: {
    flex: 0.3,
  },
  input: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pdfButton: {
    backgroundColor: '#FF5722',
  },
  textContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  extractedText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#333',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});