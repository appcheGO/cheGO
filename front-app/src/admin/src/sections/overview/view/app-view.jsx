import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Container, Box, Typography, Button } from "@mui/material";
import Header from "../../../layouts/dashboard/header";

export default function AppView() {
  const firebaseConfig = {
    apiKey: "AIzaSyAeEFkpZJQ_gw7GowD5SZlWl5XnJQLnXAQ",
    authDomain: "chego-delivery-app.firebaseapp.com",
    databaseURL: "https://chego-delivery-app-default-rtdb.firebaseio.com",
    projectId: "chego-delivery-app",
    storageBucket: "chego-delivery-app.appspot.com",
    messagingSenderId: "471857496315",
    appId: "1:471857496315:web:c1809f1b3659ad753d305e",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [pedidoRecebido, setPedidoRecebido] = useState(null);
  const [pedidoEmPreparo, setPedidoEmPreparo] = useState(null);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [pedidoRecebidoValido, setPedidoRecebidoValido] = useState(false);
  const [enderecoVisivel, setEnderecoVisivel] = useState(false);

  const [enderecoPedidoRecebido, setEnderecoPedidoRecebido] = useState({
    rua: "",
    bairro: "",
    casaApto: "",
    cep: "",
    cidade: "",
    complemento: "",
    estado: "",
  });

  

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const users = ["85 9 82168756", "99 9 99999999", "85 9 82168755"];
  useEffect(() => {
    const unsubscribeCallbacks = users.map((userId) => {
      const ordersQuery = query(collection(db, "Usuarios", userId, "Pedidos"));

      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        let lastProcessedOrderId = null;

        snapshot.forEach((doc) => {
          const orderData = doc.data();
          const orderNumber = doc.id;

          if (
            lastProcessedOrderId === null ||
            orderNumber > lastProcessedOrderId
          ) {
            setPedidoRecebido({
              numeroPedido: orderNumber,
              ...orderData,
            });
            setPedidoRecebidoValido(true);

            const endereco = orderData.DadosPessoais.endereco;
            setEnderecoPedidoRecebido(endereco);

            lastProcessedOrderId = orderNumber;
          }
        });
      });

      return unsubscribe;
    });

    return () => {
      unsubscribeCallbacks.forEach((unsubscribe) => {
        unsubscribe();
      });
    };
  }, [app, db, users]);

  const prepararPedido = () => {
    if (pedidoRecebidoValido && pedidoRecebido) {
      setPedidoEmPreparo(pedidoRecebido);
      setPedidoRecebido(null);
      setPedidoRecebidoValido(false);
    }
  };

  const pedidoPronto = () => {
    if (pedidoEmPreparo) {
      setPedidoFinalizado(pedidoEmPreparo);
      setPedidoEmPreparo(null);
    }
  };

  const toggleEnderecoVisivel = () => {
    setEnderecoVisivel(!enderecoVisivel);
  };

  return (
    <Container
      sx={{
        height: "100dvh",
        width: "100dvw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5rem",
        position: "absolute",
        overflow: "auto",
      }}
    >
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
          height: "10rem",
          position: "relative",
          top: "8rem",
          gap: "1rem",
        }}
      >
        <Box
          className="box-shadow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            height: "100%",
            backgroundColor: "lightblue",
            padding: ".8rem",
            border: "1px  solid",
            minWidth: "20rem",
          }}
        >
          <Typography variant="h6">Quantidade de pedidos hoje:</Typography>
          <Typography variant="h3">10</Typography>
        </Box>
        <Box
          className="box-shadow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            height: "100%",
            backgroundColor: "red",
            padding: "1rem",
            border: "1px solid",
            minWidth: "20rem",
          }}
        >
          <Typography variant="h6">Pedidos cancelados hoje:</Typography>
          <Typography variant="h3">0</Typography>
        </Box>
        <Box
          className="box-shadow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            height: "100%",
            backgroundColor: "green",
            padding: "1rem",
            border: "1px solid",
            minWidth: "20rem",
          }}
        >
          <Typography variant="h6">Recebido hoje:</Typography>
          <Typography variant="h3">R$ 349,00</Typography>
        </Box>

        <Box
          className="box-shadow"
          sx={{
            backgroundColor: "#f46c26",
            width: "20rem",
            maxHeight: "30rem",
          }}
        >
          <Typography variant="h6">Pedidos Recebidos:</Typography>

          {users.map((userId) => (
            <Box key={userId} sx={{ margin: "1rem 0" }}>
              <Typography>Usuário: {userId}</Typography>
              <Box sx={{ border: "1px solid #333" }}>
                {pedidoRecebidoValido && (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography>
                      <b>Nome :</b> {pedidoRecebido.DadosPessoais.nome}
                      <br />
                      <b>Telefone :</b>
                      {pedidoRecebido.DadosPessoais.telefone}
                    </Typography>
                  </Box>
                )}
                {pedidoRecebidoValido && (
                  <Typography>
                    <b>Pedido :</b> {pedidoRecebido.numeroPedido}
                  </Typography>
                )}
                {pedidoRecebidoValido && (
                  <Button
                    sx={{ backgroundColor: "green", color: "white" }}
                    onClick={toggleEnderecoVisivel}
                  >
                    {enderecoVisivel ? "Esconder Endereço" : "Mostrar Endereço"}
                  </Button>
                )}
                {enderecoVisivel && pedidoRecebidoValido && (
                  <Typography>
                    <b>Endereço :</b>
                    <br />
                    Rua: {enderecoPedidoRecebido.rua}
                    <br />
                    Bairro: {enderecoPedidoRecebido.bairro}
                    <br />
                    Casa/Apto: {enderecoPedidoRecebido.casaApto}
                    <br />
                    CEP: {enderecoPedidoRecebido.cep}
                    <br />
                    Cidade: {enderecoPedidoRecebido.cidade}
                    <br />
                    Complemento: {enderecoPedidoRecebido.complemento}
                    <br />
                    Estado: {enderecoPedidoRecebido.estado}
                  </Typography>
                )}

                {pedidoRecebidoValido && (
                  <Button
                    sx={{ backgroundColor: "green", color: "white" }}
                    onClick={prepararPedido}
                  >
                    Preparar Pedido
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          className="box-shadow"
          sx={{
            backgroundColor: "#7ac142",
            width: "20rem",
            maxHeight: "30rem",
          }}
        >
          <Typography variant="h6">Pedido em Preparo:</Typography>
          {pedidoEmPreparo && (
            <Box sx={{ border: "1px green solid" }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>
                  <b>Nome :</b> {pedidoEmPreparo.DadosPessoais.nome}
                  <br />
                  <b>Telefone :</b> {pedidoEmPreparo.DadosPessoais.telefone}
                </Typography>
                {pedidoEmPreparo && (
                  <Button
                    sx={{ backgroundColor: "green", color: "white" }}
                    onClick={toggleEnderecoVisivel}
                  >
                    {enderecoVisivel ? "Esconder Endereço" : "Mostrar Endereço"}
                  </Button>
                )}
                {enderecoVisivel && pedidoEmPreparo && (
                  <Typography>
                    <b>Endereço :</b>
                    <br />
                    Rua: {enderecoPedidoRecebido.rua}
                    <br />
                    Bairro: {enderecoPedidoRecebido.bairro}
                    <br />
                    Casa/Apto: {enderecoPedidoRecebido.casaApto}
                    <br />
                    CEP: {enderecoPedidoRecebido.cep}
                    <br />
                    Cidade: {enderecoPedidoRecebido.cidade}
                    <br />
                    Complemento: {enderecoPedidoRecebido.complemento}
                    <br />
                    Estado: {enderecoPedidoRecebido.estado}
                  </Typography>
                )}
                <Typography>
                  <b>Pedido :</b> {pedidoEmPreparo.numeroPedido}
                </Typography>
              </Box>
              <Button
                sx={{ backgroundColor: "green", color: "white" }}
                onClick={pedidoPronto}
              >
                Pedido Pronto
              </Button>
            </Box>
          )}
        </Box>

        <Box
          className="box-shadow"
          sx={{
            backgroundColor: "lightblue",
            width: "20rem",
            maxHeight: "30rem",
          }}
        >
          <Typography variant="h6">Pedido Finalizado:</Typography>
          {pedidoFinalizado && (
            <Box sx={{ border: "1px blue solid" }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>
                  <b>Nome :</b> {pedidoFinalizado.DadosPessoais.nome}
                  <br />
                  <b>Telefone :</b> {pedidoFinalizado.DadosPessoais.telefone}
                </Typography>
                {pedidoFinalizado && (
                  <Button
                    sx={{ backgroundColor: "green", color: "white" }}
                    onClick={toggleEnderecoVisivel}
                  >
                    {enderecoVisivel ? "Esconder Endereço" : "Mostrar Endereço"}
                  </Button>
                )}
                {enderecoVisivel && pedidoFinalizado && (
                  <Typography>
                    <b>Endereço :</b>
                    <br />
                    Rua: {enderecoPedidoRecebido.rua}
                    <br />
                    Bairro: {enderecoPedidoRecebido.bairro}
                    <br />
                    Casa/Apto: {enderecoPedidoRecebido.casaApto}
                    <br />
                    CEP: {enderecoPedidoRecebido.cep}
                    <br />
                    Cidade: {enderecoPedidoRecebido.cidade}
                    <br />
                    Complemento: {enderecoPedidoRecebido.complemento}
                    <br />
                    Estado: {enderecoPedidoRecebido.estado}
                  </Typography>
                )}
                <Typography>
                  <b>Pedido :</b> {pedidoFinalizado.numeroPedido}
                </Typography>
              </Box>
              <Button sx={{ backgroundColor: "blue", color: "white" }}>
                Esperar Entregador
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
