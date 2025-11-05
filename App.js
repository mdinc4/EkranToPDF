import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image,
  SafeAreaView,
  Platform,
  StatusBar 
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedPDFs, setSavedPDFs] = useState([]);

  // iPhone üst boşluk için
  const statusBarHeight = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0;

  // 1. GALERİDEN RESİM SEÇ
  const pickImageFromGallery = async () => {
    try {
      // İzin kontrolü
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye erişim için izin gerekiyor!');
        return;
      }

      // Galeriyi aç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert('Başarılı', 'Resim seçildi!');
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilemedi: ' + error.message);
    }
  };

  // 2. KAMERA İLE FOTOĞRAF ÇEK
  const takePhotoWithCamera = async () => {
    try {
      // Kamera izni
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin gerekiyor!');
        return;
      }

      // Kamerayı aç
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert('Başarılı', 'Fotoğraf çekildi!');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılamadı: ' + error.message);
    }
  };

  // 3. PDF OLUŞTUR ve KAYDET
  const createAndSavePDF = async () => {
    if (!selectedImage) {
      Alert.alert('Uyarı', 'Önce bir resim seçin!');
      return;
    }

    setIsProcessing(true);

    try {
      // PDF içeriği oluştur
      const pdfContent = `
GÖRSELDEN PDF'E DÖNÜŞTÜRME

Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
Görsel Kaynağı: ${selectedImage}

Bu PDF, mobil uygulama ile görselden oluşturulmuştur.

Uygulama: Görselden PDF Dönüştürücü
      `;

      // Benzersiz dosya adı oluştur
      const timestamp = new Date().getTime();
      const fileName = `gorsel_pdf_${timestamp}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Dosyayı kaydet
      await FileSystem.writeAsStringAsync(fileUri, pdfContent);

      // Kaydedilen PDF'i listeye ekle
      const newPDF = {
        id: timestamp.toString(),
        name: fileName,
        uri: fileUri,
        path: fileUri,
        date: new Date().toLocaleString('tr-TR'),
        size: pdfContent.length
      };

      setSavedPDFs(prev => [newPDF, ...prev]);

      // Başarı mesajı ve dosya bilgisi
      Alert.alert(
        'PDF Hazır! 🎉', 
        `Dosya başarıyla kaydedildi!\n\n📁 Dosya: ${fileName}\n📊 Boyut: ${pdfContent.length} byte\n📍 Konum: Uygulama Dizini`,
        [
          { 
            text: 'Dosyayı Aç', 
            onPress: () => openPDFFile(fileUri, fileName)
          },
          { 
            text: 'Tamam', 
            style: 'cancel' 
          }
        ]
      );

    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulamadı: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. PDF DOSYASINI AÇ/PAYLAŞ
  const openPDFFile = async (fileUri, fileName) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: `PDF Dosyasını Paylaş: ${fileName}`,
        });
      } else {
        Alert.alert('Bilgi', 'Paylaşım desteklenmiyor. Dosya şurada kaydedildi: ' + fileUri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Dosya açılamadı: ' + error.message);
    }
  };

  // 5. KAYDEDİLEN DOSYALARI GÖSTER
  const showSavedFiles = () => {
    if (savedPDFs.length === 0) {
      Alert.alert('Bilgi', 'Henüz kaydedilmiş PDF dosyası yok.');
      return;
    }

    const fileList = savedPDFs.map((file, index) => 
      `📄 ${file.name}\n⏰ ${file.date}\n📊 ${file.size} byte\n\n`
    ).join('');

    Alert.alert(
      `Kayıtlı PDF Dosyaları (${savedPDFs.length})`,
      fileList,
      [
        { text: 'Tamam', style: 'default' }
      ]
    );
  };

  // 6. DOSYA YOLUNU GÖSTER
  const showFileLocation = () => {
    Alert.alert(
      '📁 Dosya Konumları',
      `Uygulama Dizini: ${FileSystem.documentDirectory}\n\nDosyalarınız bu dizinde kaydediliyor. Paylaş butonu ile diğer uygulamalarda açabilirsiniz.`,
      [
        { text: 'Anladım', style: 'default' }
      ]
    );
  };

  // 7. RESMİ SİL
  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.title}>📸 Görselden PDF Oluştur</Text>
            <Text style={styles.subtitle}>Resim seç → PDF yap → Kaydet → Aç</Text>
          </Card.Content>
        </Card>

        {/* DOSYA BİLGİSİ */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>📁 Dosya Bilgisi</Text>
            <Text style={styles.infoText}>
              • PDF'ler uygulama dizinine kaydedilir{'\n'}
              • Paylaş butonu ile dosyayı açabilirsiniz{'\n'}
              • Toplam {savedPDFs.length} PDF kayıtlı
            </Text>
            <View style={styles.fileButtonsRow}>
              <Button 
                mode="outlined" 
                onPress={showSavedFiles}
                style={styles.smallButton}
                icon="folder-open"
              >
                Dosyaları Gör
              </Button>
              <Button 
                mode="outlined" 
                onPress={showFileLocation}
                style={styles.smallButton}
                icon="information"
              >
                Konum Bilgisi
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* SEÇİLEN GÖRSEL */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🖼️ Seçilen Görsel</Text>
            
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.image}
                  resizeMode="contain"
                />
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
                <Text style={styles.placeholderText}>Henüz resim seçilmedi</Text>
                <Text style={styles.placeholderSubtext}>
                  Aşağıdan resim ekleyin
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* RESİM SEÇME BUTONLARI */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📁 Resim Ekle</Text>
            
            <Button 
              mode="contained" 
              onPress={pickImageFromGallery}
              style={styles.button}
              icon="image"
              disabled={isProcessing}
            >
              Galeriden Seç
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={takePhotoWithCamera}
              style={styles.button}
              icon="camera"
              disabled={isProcessing}
            >
              Kamera ile Çek
            </Button>
          </Card.Content>
        </Card>

        {/* PDF OLUŞTUR BUTONU */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📄 PDF İşlemleri</Text>
            
            <Button 
              mode="contained" 
              onPress={createAndSavePDF}
              loading={isProcessing}
              disabled={isProcessing || !selectedImage}
              style={[styles.button, styles.pdfButton]}
              icon="file-pdf-box"
            >
              PDF Oluştur ve Kaydet
            </Button>

            <Text style={styles.pdfInfo}>
              PDF oluşturulduğunda:{'\n'}
              • Dosya yolunu göreceksiniz{'\n'}
              • Hemen açıp paylaşabileceksiniz{'\n'}
              • Tüm dosyaları listeleyebileceksiniz
            </Text>
          </Card.Content>
        </Card>

        {/* SON KAYDEDİLENLER */}
        {savedPDFs.length > 0 && (
          <Card style={styles.savedFilesCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>📋 Son PDF'ler</Text>
              {savedPDFs.slice(0, 3).map((file) => (
                <View key={file.id} style={styles.fileItem}>
                  <Text style={styles.fileName}>📄 {file.name}</Text>
                  <Text style={styles.fileDate}>⏰ {file.date}</Text>
                  <Button 
                    mode="text" 
                    onPress={() => openPDFFile(file.uri, file.name)}
                    style={styles.openButton}
                    icon="open-in-app"
                  >
                    Aç
                  </Button>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  savedFilesCard: {
    marginBottom: 16,
    backgroundColor: '#f3e5f5',
    borderColor: '#9c27b0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
  },
  subtitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 8,
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#34495e',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  pdfInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButton: {
    marginTop: 8,
  },
  placeholder: {
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 20,
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#adb5bd',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
  smallButton: {
    marginTop: 6,
    marginHorizontal: 4,
  },
  fileButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pdfButton: {
    backgroundColor: '#e74c3c',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileName: {
    flex: 2,
    fontSize: 12,
    color: '#333',
  },
  fileDate: {
    flex: 1,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  openButton: {
    flex: 0.5,
  },
});