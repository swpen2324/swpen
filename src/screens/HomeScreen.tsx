// HomeScreen.tsx (other screens follow a similar pattern)
import React from 'react';
import { View, Button, TouchableOpacity, ImageRequireSource } from 'react-native';
import {
  Pressable,
  Center,
  Box,
  Text,
  Row,
  Spacer,
  VStack,
  Image,
} from 'native-base';

const HomeScreen = ({ navigation }) => {
  function ImageButton({
    onPress,
    description,
    requireAsset,
  }: {
    onPress: () => void;
    description: string;
    requireAsset: ImageRequireSource;
  }) {
    return (
      <VStack flex={1} justifyContent="center" alignItems="center">
        <Pressable onPress={onPress}>
          {({ isPressed }) => {
            return (
              <Center>
                <Image
                  blurRadius={isPressed ? 20 : 0}
                  borderRadius="40"
                  size={isPressed ? '56' : '64'}
                  source={requireAsset}
                  alt={description}
                />
                <Text>{description}</Text>
              </Center>
            );
          }}
        </Pressable>
      </VStack>
    );
  }
  
  return (
    <View>
      {/* <Text>SwimmerPen</Text> */}
      <Row flex={1} justifyContent="space-around" alignItems="center">
        <Spacer />
        <Box flex={3} h="95%">
          <ImageButton
            onPress={() => navigation.navigate('Camera')}
            description="Camera"
            requireAsset={require('../../assets/swimButton.jpg')}
          />
        </Box>
        <Spacer />
        <Box flex={3} h="95%">
          <ImageButton
            onPress={() => navigation.navigate('Annotation')}
            description="Annotation"
            requireAsset={require('../../assets/annotationButton.jpg')}
          />
        </Box>
        <Spacer />
        <Box flex={3} h="95%">
          <ImageButton
            onPress={() => navigation.navigate('Report')}
            description="Report"
            requireAsset={require('../../assets/statisticsButton.jpg')}
          />
        </Box>
        <Spacer />
      </Row>
    </View>
  );
};

export default HomeScreen;


