import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Logo from "@mui/material/Avatar";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InfoIcon from "@mui/icons-material/Info";
import { useCarrinho } from "../../context/useCarrinho";
import Img from "../../../public/logo-Dona-do-Sabor.png"
import "./header.css";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions, 
  Snackbar,
  Alert,
} from "@mui/material";

export default function Header() {
  const {  handleCloseAlert, isAlertOpen } = useCarrinho();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

 

  return (
    <React.Fragment>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          padding: " 10px 4px",
          position: "absolute",
          width: " 80%",
          minWidth: "270px",
          maxWidth: "540px",
          minHeight: "78px",
          borderRadius: "25px !important",
          boxShadow:
            "2px 0px 10px 1px rgba(0, 0, 0, 0.2), 4px 6px 10px 2px rgba(0, 0, 0, 0.14), 6px 6px 8px 3px rgba(0, 0, 0, 0.12)",
          border: " 1px #f76d26 solid",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Box id="teste">
          <Logo id="imglogo" alt="Remy Sharp" src={Img} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              color: " #29292c",
            }}
          >
            <h2>Dona do Sabor</h2>

            <Typography
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {<WhatsAppIcon />}85 987206514
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                }}
              >
                <Box
                  className={isAlertOpen ? "bolaVerde" : "bolaVermelha"}
                ></Box>
                {isAlertOpen ? "Aberto" : "Fechado"}
                <InfoIcon onClick={() => setIsModalOpen(true)} />
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
      {!isAlertOpen && (
        <Snackbar open={!isAlertOpen} onClose={handleCloseAlert}>
          <Alert
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            elevation={6}
            variant="filled"
            severity="error"
          >
            Estabelecimento fechado!
          </Alert>
        </Snackbar>
      )}

      <Dialog
        sx={{
          height: "100%",
        }}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <DialogTitle sx={{ height: "100%", background: "#fae9de" }}>
          Informações Adicionais
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            background: "#fae9de",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Typography variant="h6">Horário de funcionamento: </Typography>
            <Typography>
              <b>Segunda-feira:</b>16:00 as 00:00
            </Typography>
            <Typography>
              <b>Terça-feira:</b>16:00 as 00:00
            </Typography>
            <Typography>
              <b>Quarta-feira:</b>Fechado
            </Typography>
            <Typography>
              <b>Quinta-feira</b>:16:00 as 00:00
            </Typography>
            <Typography>
              <b>Sexta-feira:</b>16:00 as 00:00
            </Typography>
            <Typography>
              <b>Sabado:</b>16:00 as 00:00
            </Typography>
            <Typography>
              <b>Domingo:</b>16:00 as 00:00
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              mt: 2,
            }}
          >
            
            <Typography variant="h6">Formas de pagamento:</Typography>
            <Typography>
              <b>Credito</b>: Visa, Mastercard, Hipercard
            </Typography>
            <Typography>
              <b>Debito:</b> Visa, Mastercard, Hipercard
            </Typography>
            <Typography>
              <b>Vale Refeição:</b> Sodexo, Ticket, Ben Visa
            </Typography>
            <Typography>
              <b>Transferencia:</b> Pix
            </Typography>
            <Typography>
              <b>Dinheiro</b>
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              mt: 2,
            }}
          >
            <Typography variant="h6">Áreas de Entrega e Valores:</Typography>
            <Typography>
              <b>Pedrinhas:</b> R$ 2,00
            </Typography>
            <Typography>
              <b>Bairro da paz:</b> R$ 4,00
            </Typography>
            <Typography>
              <b>Bairro da luz:</b> R$ 7,00
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fae9de",
          }}
        >
          <Button
            className="box-shadow click"
            sx={{
              background: "#f46c26",
              color: "#fae9de",
              "&:hover": {
                background: "#f46c26",
              },
            }}
            onClick={() => setIsModalOpen(false)}
            color="primary"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
