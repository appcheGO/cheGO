import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
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

  const [setUserOrders] = useState([]);
  const [pedidoRecebido, setPedidoRecebido] = useState(null);
  const [pedidoEmPreparo, setPedidoEmPreparo] = useState(null);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);

  const [lastOrder, setLastOrder] = useState(null);
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

  useEffect(() => {
    const db = getFirestore(app);
    const userId = "85 9 82168756";

    async function fetchUserOrders() {
      const ordersQuery = query(collection(db, "Usuarios", userId, "Pedidos"));
      const ordersSnapshot = await getDocs(ordersQuery);

      const userOrders = [];

      ordersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        const orderNumber = orderDoc.id;

        userOrders.push({
          numeroPedido: orderNumber,
          ...orderData,
        });
      });

      setUserOrders(userOrders);

      if (userOrders.length > 0) {
        const lastUserOrder = userOrders[userOrders.length - 1];
        if (lastUserOrder !== lastOrder) {
          setLastOrder(lastUserOrder);

          if (!pedidoEmPreparo && !pedidoFinalizado) {
            setPedidoRecebido(lastUserOrder);
            setPedidoRecebidoValido(true);
          }

          const endereco = lastUserOrder.DadosPessoais.endereco;
          setEnderecoPedidoRecebido(endereco);
        }
      }
    }

    const intervalId = setInterval(() => {
      fetchUserOrders();
    }, 20000000);

    return () => {
      clearInterval(intervalId);
    };
  }, [app, lastOrder, pedidoEmPreparo, pedidoFinalizado]);

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
          <Typography variant="h6">Pedido Recebido:</Typography>
          <Box>
            {pedidoRecebidoValido && (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>
                  <b>Nome :</b> {pedidoRecebido.DadosPessoais.nome}
                  <br />
                  <b>Telefone :</b> {pedidoRecebido.DadosPessoais.telefone}
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
