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

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // 3. PDF OLUŞTUR
  const createPDF = async () => {
    if (!selectedImage) {
      Alert.alert('Uyarı', 'Önce bir resim seçin!');
      return;
    }

    setIsProcessing(true);

    try {
      // PDF oluşturma simülasyonu
      setTimeout(() => {
        Alert.alert(
          'PDF Hazır! 🎉', 
          'PDF başarıyla oluşturuldu!',
          [
            {
              text: 'Tamam',
              style: 'default'
            }
          ]
        );
        setIsProcessing(false);
      }, 1500);

    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulamadı: ' + error.message);
      setIsProcessing(false);
    }
  };

  // 4. RESMİ SİL
  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK - iPhone üst boşluktan sonra */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.title}>📸 Görselden PDF Oluştur</Text>
            <Text style={styles.subtitle}>Resim seç ve PDF'e dönüştür</Text>
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
                  Galeriden seçin veya fotoğraf çekin
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
              onPress={createPDF}
              loading={isProcessing}
              disabled={isProcessing || !selectedImage}
              style={[styles.button, styles.pdfButton]}
              icon="file-pdf-box"
            >
              PDF Oluştur
            </Button>
          </Card.Content>
        </Card>

        {/* BİLGİ */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>ℹ️ Nasıl Kullanılır?</Text>
            <Text style={styles.infoText}>
              1. 📁 Galeriden resim seç veya 📷 fotoğraf çek{'\n'}
              2. 👆 Seçilen resmi kontrol et{'\n'}
              3. 📄 PDF Oluştur butonuna bas{'\n'}
              4. 🎉 PDF'in hazır!
            </Text>
          </Card.Content>
        </Card>

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
    marginBottom: 20,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
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
    color: '#2e7d32',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
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
  pdfButton: {
    backgroundColor: '#e74c3c',
  },
});