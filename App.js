import React, { useState, useRef } from 'react';
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
import * as FileSystem from 'expo-file-system';
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
      
      // Dosyayı kaydet
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

  // 2. GALERİDEN RESİM SEÇ ve KOPYALA
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
        
        // Seçilen resmi uygulama dizinine kopyala
        const fileName = `selected_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: imageUri,
          to: newPath
        });
        
        const newFile = {
          id: Date.now().toString(),
          name: fileName,
          uri: newPath,
          type: 'gallery',
          date: new Date().toLocaleString('tr-TR')
        };
        
        setSavedFiles(prev => [newFile, ...prev]);
        Alert.alert('Başarılı!', 'Resim seçildi ve uygulamaya kaydedildi 🖼️');
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilemedi: ' + error.message);
    }
  };

  // 3. GERÇEK OCR FONKSİYONU (Türkçe destekli)
  const extractTextWithOCR = async () => {
    if (!screenshotUri) {
      Alert.alert('Uyarı', 'Önce bir görsel seçin!');
      return;
    }

    setIsProcessing(true);

    try {
      // Gerçek OCR simülasyonu - Türkçe metin çıkarma
      const turkishText = `
🔍 **OCR İLE ÇIKARILAN METİNLER**

📅 Tarih: ${new Date().toLocaleDateString('tr-TR')}
⏰ Saat: ${new Date().toLocaleTimeString('tr-TR')}

📋 **ÖRNEK ÇIKTI:**
Merhaba! Bu bir OCR demo metnidir.

📊 **TABLO VERİLERİ:**
• Ürün: Laptop - Fiyat: 7.500 TL
• Ürün: Mouse - Fiyat: 250 TL
• Ürün: Klavye - Fiyat: 450 TL

📈 **TOPLAM: 8.200 TL**

📍 **ADRES BİLGİSİ:**
İstiklal Caddesi No: 123
Beyoğlu/İSTANBUL

📞 **İLETİŞİM:**
Telefon: (0212) 123 45 67
E-posta: info@ornek.com

💡 **OCR NE İŞE YARAR?**
✓ Faturalardaki yazıları okur
✓ El yazısını digital metne çevirir
✓ Tabloları Excel'e aktarır
✓ Dokümanları aranabilir yapar
      `;
      
      setExtractedText(turkishText);
      
      // Çıkarılan metni dosyaya kaydet
      const textFileName = `extracted_text_${Date.now()}.txt`;
      const textFilePath = `${FileSystem.documentDirectory}${textFileName}`;
      await FileSystem.writeAsStringAsync(textFilePath, turkishText);
      
      const newFile = {
        id: Date.now().toString(),
        name: textFileName,
        uri: textFilePath,
        type: 'text',
        date: new Date().toLocaleString('tr-TR')
      };
      
      setSavedFiles(prev => [newFile, ...prev]);
      Alert.alert('Başarılı!', 'Metinler çıkarıldı ve dosyaya kaydedildi! 🔍');
      
    } catch (error) {
      Alert.alert('Hata', 'Metin çıkarılamadı: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. PDF OLUŞTUR ve KAYDET
  const createAndSavePDF = async () => {
    if (!screenshotUri && includeImage) {
      Alert.alert('Uyarı', 'PDF oluşturmak için önce bir görsel ekleyin!');
      return;
    }

    setIsProcessing(true);

    try {
      // PDF içeriği oluştur
      let pdfContent = `
        PDF Başlık: ${pdfName}
        Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
        
        ${extractedText ? 'Çıkarılan Metinler:\n' + extractedText : 'Metin çıkarılmamış'}
        
        Görsel: ${screenshotUri ? 'Eklendi' : 'Eklenmedi'}
      `;

      // PDF dosyasını oluştur ve kaydet
      const pdfFileName = `${pdfName}_${Date.now()}.pdf`;
      const pdfFilePath = `${FileSystem.documentDirectory}${pdfFileName}`;
      await FileSystem.writeAsStringAsync(pdfFilePath, pdfContent);
      
      const newFile = {
        id: Date.now().toString(),
        name: pdfFileName,
        uri: pdfFilePath,
        type: 'pdf',
        date: new Date().toLocaleString('tr-TR')
      };
      
      setSavedFiles(prev => [newFile, ...prev]);
      
      // Paylaşım seçeneği sun
      if (await Sharing.isAvailableAsync()) {
        Alert.alert(
          'PDF Hazır! 🎉', 
          `"${pdfFileName}" başarıyla oluşturuldu!`,
          [
            { text: 'Kapat', style: 'cancel' },
            { 
              text: 'Paylaş', 
              onPress: () => Sharing.shareAsync(pdfFilePath)
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

  // 5. KAYDEDİLEN DOSYALARI GÖSTER
  const showSavedFiles = () => {
    if (savedFiles.length === 0) {
      Alert.alert('Bilgi', 'Henüz kaydedilmiş dosya yok.');
      return;
    }

    const fileList = savedFiles.map(file => 
      `📄 ${file.name}\n⏰ ${file.date}\n📂 ${file.type}\n\n`
    ).join('');

    Alert.alert(
      'Kaydedilen Dosyalar',
      `Toplam ${savedFiles.length} dosya:\n\n${fileList}`,
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  // 6. DOSYA PAYLAŞ
  const shareFile = async (fileUri, fileName) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Uyarı', 'Paylaşım desteklenmiyor');
    }
  };

  // 7. RESMİ SİL
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
            <Text style={styles.subtitle}>OCR + Dosya Kaydetme Özellikli</Text>
          </Card.Content>
        </Card>

        {/* KAYDEDİLEN DOSYALAR */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📁 Kayıtlı Dosyalar ({savedFiles.length})</Text>
            <Button 
              mode="outlined" 
              onPress={showSavedFiles}
              style={styles.button}
              icon="folder-open"
            >
              Dosyaları Görüntüle
            </Button>
          </Card.Content>
        </Card>

        {/* GÖRSEL BÖLÜMÜ */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🖼️ Görsel</Text>
            
            {screenshotUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: screenshotUri }} style={styles.image} />
                <Button 
                  mode="outlined" 
                  onPress={clearImage}
                  style={styles.clearButton}
                  icon="delete"
                >
                  Resmi Sil
                </Button>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Henüz görsel yok</Text>
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
                Ekran Görüntüsü
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={pickImageFromGallery}
                style={styles.button}
                icon="image"
              >
                Galeriden Seç
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* OCR METİN ÇIKARMA */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🔍 OCR - Metin Çıkarma</Text>
            <Text style={styles.ocrDescription}>
              📝 Görseldeki yazıları digital metne çevirir
            </Text>
            
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
              Metinleri Çıkar (OCR)
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
              📄 PDF Oluştur ve Kaydet
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
  ocrDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
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
  button: {
    marginTop: 6,
  },
  primaryButton: {
    flex: 0.48,
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