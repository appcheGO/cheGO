import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { Button, Fade, Modal, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputMask from "react-input-mask";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCarrinho } from "../context/useCarrinho";



import "./RegisterScreen.css";
const campoObrigatorio = (
  <Typography variant="caption" style={{ color: "red", marginLeft: "5px" }}>
    Campo obrigatório
  </Typography>
  
);

const schema = yup
  .object({
    cep: yup.string().required(campoObrigatorio),
    rua: yup.string().required(campoObrigatorio),
    casaApto: yup.string().required(campoObrigatorio),
    complemento: yup.string(),
    bairro: yup.string().required(campoObrigatorio),
    cidade: yup.string().required(campoObrigatorio),
    estado: yup.string().required(campoObrigatorio).length(2, campoObrigatorio),
    nome: yup.string().required(campoObrigatorio),
    telefone: yup.string().test("telefone", campoObrigatorio, (value) => {
      if (!value) {
        return false;
      }

      const numericValue = value.replace(/\D/g, "");

      return numericValue.length === 11;
    }),
  })
  .required();


const RegisterScreen = () => {
  const { saveUserData} = useCarrinho();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    setFocus,
  } = useForm({
    resolver: yupResolver(schema),
  });
  

  const [numberPhone, setNumberPhone] = useState("");

  const [open, setOpen] = useState(false);

  const handleFormSubmit = (data) => {
    if (isValid) {
      console.log("Form submitted without errors");
      handleOpen();
 
      saveUserData(data);
    } else {
      console.log("Form has errors:", errors);
    }
  };

  const handleOpen = () => {
    if (isValid) {
      console.log("Opening modal");
      setOpen(true);
    } else {
      console.log("Form is not valid");
    }
    console.log(isValid);
  };



  const checkCEP = (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep === "") {
      setValue("address");
      setValue("casaApto");
      setValue("addresscomplement");
      setValue("neighborhood");
      setValue("city");
      setValue("uf");
      console.log(e);
    } else {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          setValue("cep", data.cep);
          setValue("rua", data.logradouro);
          setValue("bairro", data.bairro);
          setValue("cidade", data.localidade);
          setValue("estado", data.uf);
          setFocus("casaApto");
        });
    }
  };

  const removeError = (field) => {
    if (errors[field]) {
      errors[field] = undefined;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box
          sx={{
            overflow: "auto",
            height: "100dvh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <Box
            sx={{
              background: "#f46c26",
              width: "100vw",
              height: "10%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                height: "4rem",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Box className="iconAndText">
                <NavLink to="/" style={{ color: "#f9e9df" }}>
                  <ArrowBackIcon />
                </NavLink>
                <Typography variant="h6">Cadastro</Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: "#f9e9df ",
              display: "flex",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              flexDirection: "column",
              height: "100%",
              minHeight: "32rem",
              justifyContent: "space-between",
              borderRadius: "25px 25px 0 0",
              zIndex: "2",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#f9e9df ",
                display: "flex",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                flexDirection: "column",
                height: "10%",
                width: "100%",
                position: "absolute",
                left: "0",
                bottom: "83%",
                justifyContent: "space-between",
                borderRadius: "25px 25px 0 0",
                zIndex: "-1",
              }}
            ></Box>
            <Typography variant="h6">Endereço</Typography>
            <Box id="inputAndBtnSerach">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <label className="labelFormEndereco">CEP </label>
                <InputMask
                  name="cep"
                  mask="99999-999"
                  maskChar={null}
                  className="inputFormEndereco cep"
                  {...register("cep")}
                  
                  onInput={() => removeError("cep")}
                  onBlur={checkCEP}
                />
              </Box>

              <Button
                className="btnsearch click"
                sx={{
                  color: "#f46c26",
                  background: "#f9e9df",
                  marginLeft: "10px",
                  height: "2rem",
                  minWidth: "2.3rem",
                  padding: "0 ",
                  position: "relative",
                  top: "0.6rem",
                  left: "0",
                  border: "1px solid #f16d2f",
                  borderRadius: "8px",
                  boxShadow:
                    " 5px 4px 5px 2px rgba(0, 0, 0, 0.2), 5px 4px 5px 2px rgba(0, 0, 0, 0.14), 5px 4px 5px 2px rgba(0, 0, 0, 0.12) !important;",
                }}
              >
                <SearchRoundedIcon />
              </Button>
            </Box>
            <p>{errors.cep?.message}</p>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label className="labelFormEndereco">Rua </label>
              <input
                type="text"
                name="rua"
                className="inputFormEndereco"
                {...register("rua")}
                
                onInput={() => removeError("rua")}
              />
              <p>{errors.rua?.message}</p>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label className="labelFormEndereco">Numero</label>
              <input
                type="text"
                name="casaApto"
                className="inputFormEndereco"
                {...register("casaApto")}
                
              />
              <p>{errors.casaApto?.message}</p>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label className="labelFormEndereco">
                Complemento/Ponto de Referência
              </label>
              <input
                type="text"
                className="inputFormEndereco"
                {...register("complemento")}
                
              />
              <p>{errors.complemento?.message}</p>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label className="labelFormEndereco">Bairro</label>
              <input
                type="text"
                className="inputFormEndereco"
                {...register("bairro")}
                
              />
              <p>{errors.bairro?.message}</p>
            </Box>
            <Box id="inputCidadeEEstado">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <label className="labelFormEndereco onlyLetters">Cidade</label>
                <input
                  type="text"
                  className="inputFormEndereco"
                  {...register("cidade")}
                 
                />
                <p>{errors.cidade?.message}</p>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <label className="labelFormEndereco onlyLetters">Estado</label>
                <input
                  type="text"
                  className="inputFormEndereco w4rem"
                  {...register("estado")}
                 
                />
                <p>{errors.estado?.message}</p>
              </Box>
            </Box>
            <Typography variant="h6">Dados Pessoais</Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label className="labelFormEndereco">Nome</label>
              <input
                style={{ textTransform: "captalize" }}
                type="text"
                className="inputFormEndereco "
                {...register("nome")}
                
              />
              <p>{errors.nome?.message}</p>
            </Box>
            <Box id="inputTelEWhats">
              <Box id="inputTelefone">
                <label className="labelFormEndereco">Nº Telefone</label>

                <InputMask
                  mask="99 9 99999999"
                  maskChar={null}
                  className="inputFormEndereco w9rem"
                  value={numberPhone}
                  {...register("telefone")}
                  onChange={(e) => {
                    console.log("Telefone alterado:", e.target.value);
                    setNumberPhone(e.target.value);
                
                  }}
                />
                <p>{errors.telefone?.message}</p>
                <Box
                  sx={{
                    width: "100%",
                    margin: " 5px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <input type="checkbox" id="" />

                  <span
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      color: "#f46c26",
                      fontFamily: "Roboto",
                      width: "100%",
                      paddingLeft: "0.6rem",
                    }}
                  >
                    Whatsapp
                  </span>
                </Box>
              </Box>
            </Box>

            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              open={open}
              closeAfterTransition
            >
              <Fade in={open}>
                <Box id="modalCadastro">
                  <Box id="modalContent">
                    <Box className="wrapper">
                      <Typography variant="h6">Cadastro Realizado</Typography>
                      <svg
                        className="checkmark"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 52 52"
                      >
                        <Box
                          className="checkmark__circle"
                          cx="26"
                          cy="26"
                          r="25"
                        ></Box>
                        <path
                          className="checkmark__check"
                          fill="none"
                          d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        ></path>
                      </svg>
                    </Box>
                  </Box>
                  <NavLink to="/pedido" style={{ color: "#f9e9df" }}>
                    <input
                      className="btnCloseService click"
                      value="Ir para Pagamento"
                      style={{
                        width: "100%",
                        textAlign: "center",
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    />
                  </NavLink>
                </Box>
              </Fade>
            </Modal>
            <input
              style={{
                background: "#f16d2f",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Roboto",
                height: "3rem",
                minHeight: "3rem",
                border: "1px solid #f46c26",
                borderRadius: "10px",
                color: "#f9e9df",
                minWidth: "226px",
                textDecoration: "none",
                transition: "background-color 0.3s",
                fontSize: "16px",
                marginBottom: "1rem",
              }}
              className="click box-shadow"
              type="submit"
              value={"Finalizar Cadastro"}
              onClick={handleOpen}
            />
          </Box>
        </Box>
      </form>
    </>
  );
};

export default RegisterScreen;
