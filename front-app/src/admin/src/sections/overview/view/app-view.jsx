import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Container, Box, Typography, Button } from "@mui/material";
import Header from "../../../layouts/dashboard/header";
import Nav from "../../../layouts/dashboard/nav"

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

  const [userOrders, setUserOrders] = useState([]);

  const [lastOrder, setLastOrder] = useState(null);
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
        }
      }
    }

    const intervalId = setInterval(() => {
      fetchUserOrders();
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [app, lastOrder]);

  return (
    <Container>
      <Header />
      
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "auto",
          width: "75vw",
        }}
      >
        <Box sx={{ backgroundColor: "#f46c26" }}>
          <Typography variant="h6">Pedido Recebido:</Typography>
          <Box sx={{ border: "1px red solid" }}>
            {userOrders.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>
                  <b>Nome :</b>
                  {userOrders[userOrders.length - 1].DadosPessoais.nome}
                  <br />
                  <b>Telefone :</b>
                  {userOrders[userOrders.length - 1].DadosPessoais.telefone}
                </Typography>
              </Box>
            )}
            {userOrders.length > 0 && (
              <Typography>
                <b>Pedido :</b> {userOrders[userOrders.length - 1].numeroPedido}
              </Typography>
            )}
            <Button
              onClick={() => {
                const phoneNumber =
                  userOrders[userOrders.length - 1].DadosPessoais.telefone;
                const message = "Pedido em Preparo";

                const countryCode = "55";

                const formattedPhoneNumber = phoneNumber.replace(/\D/g, "");

                const whatsappLink = `https://wa.me/${countryCode}${formattedPhoneNumber}?text=${encodeURIComponent(
                  message
                )}`;

                window.open(whatsappLink, "_blank");
              }}
            >
              Preparar Pedido
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#7ac142",
            height: "auto",
          }}
        >
          <Typography variant="h6">Pedido em Preparo:</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1976d2",
            height: "auto",
          }}
        >
          <Typography variant="h6">Pedido Finalizado:</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffcb00",
            height: "auto",
          }}
        >
          <Typography variant="h6">Pedido Saiu para entrega:</Typography>
        </Box>
      </Box>
    </Container>
  );
}
