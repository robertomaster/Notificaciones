import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, ToastAndroid} from 'react-native';
import {
  ActivityIndicator,
  Colors,
  Button,
  List,
  Switch,
} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import Datos from './Datos';
import BluetoothSerial from 'react-native-bluetooth-serial-next';

function Inicio({navigation}) {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigation();

  const onToggleSwitch = () => {
    if (!loading) {
      return habilitarBluetooth();
    }
    deshabilitarBluetooth();
  };

  const habilitarBluetooth = async () => {
    //Para pedir la activacion del bluetooth
    await BluetoothSerial.requestEnable();
    //Para listar los dispositivos vinulados
    const lista = await BluetoothSerial.list();
    console.log(lista);
    //Para comprobar el nombre de la pulsera
    /*
    const nombre = new Promise((resolve, reject) => {
      const dispositvo = dispositivos.name;
      verificarNombre(() =>
        dispositvo == 'Pulsera'
          ? resolve(dispositivo)
          : reject(new Error('No se encuentra la pulsera')),
      );
    });
    //se cumple la promesa
    nombre
      .then((dispositivo) => console.log(dispositivo))
      .catch((error) => console.log(error));
*/
    await BluetoothSerial.stopScanning();
    setDispositivos(lista);
    setLoading(true);
  };

  const deshabilitarBluetooth = async () => {
    await BluetoothSerial.disable();
    await BluetoothSerial.stopScanning();
    setLoading(false);
  };

  const Emparejar = async (dispositivo) => {
    await BluetoothSerial.connect(dispositivo);
    ToastAndroid.show('Conectado', ToastAndroid.SHORT);
  };

  const Mapeo = () => {
    return dispositivos.map((val, index) => (
      <View key={index} style={{padding: 10}}>
        <Button
          color="#C1CBF4"
          compact={true}
          mode="contained"
          onPress={() => {
            Emparejar(val.id);
          }}>
          <Text>{val.name}</Text>
        </Button>
        <Separator />
      </View>
    ));
  };

  const Separator = () => <View style={styles.separator} />;

  return !loading ? (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
      <Text>Encender Bluetooth</Text>
      <Switch color="#E82121" value={loading} onValueChange={onToggleSwitch} />
      <Image
        source={require('./android.png')}
        style={{
          height: 250,
          width: 250,
          resizeMode: 'contain',
        }}></Image>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>Bluetooth Encendido</Text>
      <Switch value={loading} onValueChange={onToggleSwitch} />
      <List.Section
        style={{
          margin: 10,
          borderWidth: 0.5,
          backgroundColor: '#F1EFEF',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}>
        <List.Subheader style={{fontSize: 20}}>
          Seleccione la pulsera.
        </List.Subheader>
        <Mapeo />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 30,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  containerValue: {
    backgroundColor: '#ff7550',
    borderRadius: 8,
    elevation: 6,
  },
});

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={Inicio} />
        <Stack.Screen name="Datos" component={Datos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
