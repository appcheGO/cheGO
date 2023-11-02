import {
  Modal,
  Typography,
  Button,
  Box,
  Radio,
  FormControlLabel,
  RadioGroup,
} from "@mui/material";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
function ChooseDrinkModal() {
  const [refrigeranteDoCombo, setrefrigeranteDoCombo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Modal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <Box
        sx={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          backgroundColor: "#fae9de",
          position: " absolute",
          top: " 50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: " 90%",
          maxWidth: "600px",
          height: "15rem",
          minHeight: " 100px",
          border: "6px solid #e5c7b3",
          borderRadius: " 30px",
          boxShadow: "5px 4px 5px 2px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography variant="h6" id="confirmation-modal-title"></Typography>
        {
          <>
            <Typography variant="h6" id="confirmation-modal-title">
              Escolha o refrigerante
            </Typography>
            <RadioGroup
              sx={{
                display: "flex",
                height: "40%",
                justifyContent: "space-around",
              }}
              aria-label="sabores"
              name="sabores"
              value={refrigeranteDoCombo}
              onChange={(e) => {
                setrefrigeranteDoCombo(e.target.value);
              }}
            >
              <FormControlLabel
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  height: "1rem",
                }}
                value="Pepsi 1L"
                control={<Radio />}
                label="Pepsi 1L"
              />
              <FormControlLabel
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  height: "1rem",
                }}
                value="Guarana Antartica 1L"
                control={<Radio />}
                label="Guarana Antartica 1L"
              />
            </RadioGroup>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <Button
                sx={{
                  width: "30%",
                  backgroundColor: "#f76d26 ",
                  color: "#f7e9e1",
                }}
                onClick={() => setIsModalOpen(false)}
              >
                Voltar
              </Button>
              <Button
                sx={{
                  width: "30%",
                  backgroundColor: "#f76d26 ",
                  color: "#f7e9e1",
                }}
              >
                Avançar
              </Button>
            </Box>
          </>
        }
      </Box>
    </Modal>
  );
}

export default ChooseDrinkModal;
