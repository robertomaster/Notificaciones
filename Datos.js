import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Card,
  Avatar,
  Button,
  Text,
  Colors,
} from 'react-native-paper';
import {View, Alert, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const abortController = new AbortController();
const signal = abortController.signal;
let isMounted = false;

const Datos = ({navigation, route}) => {
  const [data, setData] = useState({
    nombre: route.params.nombre,
    edad: route.params.edad,
    email: route.params.email,
    medico: route.params.medico,
    presion: 0,
    oxigeno: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigation();

  const getData = async () => {
    isMounted = true;
    await fetch('http://18.222.17.116:8069/api/signos/' + route.params.id, {
      headers: {
        Accept: 'application/json',
      },
      signal: signal,
      method: 'GET',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (isMounted) {
          setData(responseJson.valor);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getData();
    setInterval(async () => await getData(), 5000);

    return () => {
      //abortController.abort();
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await getData();
    });

    return unsubscribe;
  }, [navigation]);

  const enviarCorreo = async () => {
    const values = {
      id: route.params.id,
    };
    await fetch('http://18.222.17.116:8069/api/correo', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(values),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        Alert.alert('Datos enviados');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const User = (props) => (
    <Avatar.Image
      size={40}
      source={{
        uri:
          'https://www.psybooks.com/wp-content/uploads/psybooks-user-accounts.png',
      }}
    />
  );
  const Separator = () => <View style={styles.separator} />;

  const renderData = (type, val) => (
    <View>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 30,
          marginVertical: 15,
        }}>
        {`${val} ${type === 'presion' ? 'bpm' : '%SpO2'}`}
      </Text>
    </View>
  );
  const LeftContent = (props) => (
    <Avatar.Image
      size={40}
      source={{
        uri:
          'https://health.clevelandclinic.org/wp-content/uploads/sites/3/2020/01/mildHeartAttack-866257238-770x553.jpg',
      }}
    />
  );

  return loading ? (
    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
      <ActivityIndicator
        animating={true}
        color={Colors.red800}
        size={'large'}
      />
    </View>
  ) : (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        style={{resizeMode: 'stretch', width: 1000, height: 120}}
        source={{
          uri: 'https://www.uta.edu.ec/v3.2/uta/images/header.png',
        }}
      />
      <View style={{flexDirection: 'row'}}>
        <Card
          style={{
            flex: 1,
            flexDirection: 'row',
            padding: 10,
          }}>
          <Card.Title
            title="Signos vitales"
            subtitle="Medidos en tiempo real"
            left={LeftContent}
          />
          <View>
            <Text>Su ritmo cardiaco en bpm (batidos por minuto).</Text>
            {renderData('presion', data.presion)}
            <Text>Su nivel de oxigeno en la sangre.</Text>
            {renderData('oxigeno', data.oxigeno)}
          </View>
        </Card>
        <Card
          style={{
            flex: 1,
            flexDirection: 'row',
            padding: 10,
          }}>
          <Card.Title
            title="Datos del paciente"
            subtitle='Presione "Editar" para editar sus datos.'
            left={User}
          />
          <Text>Nombre del paciente </Text>
          <Text>{data.nombre} </Text>
          <Separator />
          <Text>Edad del paciente </Text>
          <Text>{data.edad} </Text>
          <Separator />
          <Text>Última prescripción: </Text>

          <Separator />
        </Card>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Card style={{padding: 20, flex: 1}}>
          <Button
            compact={true}
            mode="contained"
            color="#C1CBF4"
            onPress={enviarCorreo}>
            <Text>Enviar datos</Text>
          </Button>
        </Card>
        <Card style={{padding: 20, flex: 1}}>
          <Button
            compact={true}
            color="#C1CBF4"
            mode="contained"
            onPress={() => navigate.navigate('Crear', data)}>
            <Text>Editar datos</Text>
          </Button>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default Datos;
