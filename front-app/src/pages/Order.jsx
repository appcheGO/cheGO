import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PixOutlinedIcon from "@mui/icons-material/PixOutlined";
import { NavLink } from "react-router-dom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InputMask from "react-input-mask";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useCarrinho } from "../context/useCarrinho";

import "./Order.css";

const opcaoObrigatoria = (
  <Typography variant="caption" style={{ color: "red", marginLeft: "5px" }}>
    Escolha uma opção
  </Typography>
);

const SignupSchema = yup.object().shape({
  formaDeEntrega: yup
    .string()
    .oneOf(["Entrega", "Retirada"])
    .required(opcaoObrigatoria),
  formaDePagamento: yup
    .string()
    .oneOf(["cartaoDeCredito", "cartaoDeDebito", "pix", "Dinheiro"])
    .required(opcaoObrigatoria),
});

const Order = () => {
  const [userId, setUserId] = useState(null);
  const { sendOrder, saveUserData } = useCarrinho();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    setFocus,
  } = useForm({
    resolver: yupResolver(SignupSchema),
  });

  const [numberPhone, setNumberPhone] = useState("");

  const [open, setOpen] = useState(false);

  const handleFormSubmit = async (data) => {
    if (isValid) {
      try {
        const userId = await saveUserData(data);
        setUserId(userId);

        await sendOrder(data, userId);
        handleOpen();
      } catch (error) {
        console.error("Erro ao salvar os dados:", error);
      }
    } else {
      console.log("Form has errors:", errors);
    }
  };

  const handleOpen = () => {
    if (isValid) {
      setOpen(true);
    } else {
      console.log("Form is not valid");
    }
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
    <Box
      sx={{
        overflow: "auto",
        position: "relative",
        height: "100dvh",
        width: "100%",
        backgroundColor: "#f46c26",
      }}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="headerOrder">
          <Box className="iconAndText">
            <NavLink to="/" style={{ color: "#f9e9df" }}>
              <ArrowBackIcon />
            </NavLink>
            <Typography variant="h6">Checkout</Typography>
          </Box>
        </Box>
        <Box className="contentOrder">
          <Box className="cardPersonalData">
            <Box className="contentPersonalData">
              <Box
                sx={{
                  position: "absolute",
                  top: "0",
                  width: "13rem",
                  height: "2rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  alignItems: "center",
                  width: "100%",
                  color: " #f9e9df",
                  borderBottom: "1px #070707 solid",
                  zIndex: "1",
                }}
              >
                Quem pediu
              </Typography>
              <Box className="nameAndTelephone">
                <>
                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Telefone:</label>
                    <InputMask
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      mask="99 9 99999999"
                      maskChar={null}
                      value={numberPhone}
                      {...register("telefone")}
                      onChange={(e) => {
                        setNumberPhone(e.target.value);
                      }}
                    />
                  </Typography>
                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Nome: </label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      {...register("nome")}
                    />
                  </Typography>
                </>
              </Box>
            </Box>
          </Box>

          <Box className="cardDeliveryMethod">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "0",
                  width: "13rem",
                  height: "2.1rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  alignItems: "center",
                  width: "100%",
                  color: " #f9e9df",
                  borderBottom: "1px #070707 solid",
                  zIndex: "1",
                }}
              >
                Forma de Entrega
              </Typography>

              <RadioGroup sx={{ paddingLeft: "1.2rem" }} name="formaDeEntrega">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <FormControlLabel
                    value="Entrega"
                    name="Entrega"
                    {...register("formaDeEntrega")}
                    control={<Radio />}
                    label={
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <DeliveryDiningOutlinedIcon />
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            Entrega
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <FormControlLabel
                    value="Retirada"
                    name="Retirada"
                    {...register("formaDeEntrega")}
                    control={<Radio />}
                    label={
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <StorefrontOutlinedIcon />
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            Retirar no local
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </Box>
              </RadioGroup>
              {errors.formaDeEntrega && (
                <p className="error-message">{errors.formaDeEntrega.message}</p>
              )}
            </Box>
          </Box>

          <Box className="cardDeliveryAddress">
            <Box className="contentDeliveryAddress">
              <Box
                sx={{
                  position: "absolute",
                  top: "1rem",
                  width: "15rem",
                  height: "2.8rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography variant="h6" className="editInformationAddress">
                Entregar no Endereço
              </Typography>
              <Box className="addressData">
                <>
                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Cep:</label>
                    <InputMask
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      mask="99999-999"
                      maskChar={null}
                      type="text"
                      name="cep"
                      {...register("cep")}
                      onInput={() => removeError("cep")}
                      onBlur={checkCEP}
                    />
                  </Typography>

                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Rua / Av :</label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      name="rua"
                      {...register("rua")}
                      onInput={() => removeError("rua")}
                    />
                  </Typography>
                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Casa/Apto :</label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      name="casaApto"
                      {...register("casaApto")}
                    />
                  </Typography>
                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Ponto de Ref :</label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      name="complemento"
                      {...register("complemento")}
                    />
                  </Typography>

                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label> Bairro:</label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      name="bairro"
                      {...register("bairro")}
                    />
                  </Typography>

                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Cidade:</label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      name="cidade"
                      {...register("cidade")}
                    />
                  </Typography>

                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Estado:</label>
                    <input
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      type="text"
                      name="estado"
                      {...register("estado")}
                    />
                  </Typography>
                </>
              </Box>
            </Box>
          </Box>

          <Box className="cardFormOfPayment">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "0rem",
                  width: "15rem",
                  minHeight: "2rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                  zIndex: "1",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  alignItems: "center",
                  width: "100%",
                  color: " #f9e9df",
                  borderBottom: "1px #070707 solid",
                  zIndex: "1",
                }}
              >
                Forma de Pagamento
              </Typography>
              <Box className="FormOfPayment">
                <RadioGroup
                  sx={{ paddingLeft: "1.2rem" }}
                  name="formaDePagamento"
                >
                  <FormControlLabel
                    sx={{ alignItems: "baseline" }}
                    value="cartaoDeCredito"
                    name="cartao de credito"
                    {...register("formaDePagamento")}
                    control={<Radio />}
                    label={
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <CreditCardOutlinedIcon />
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            Cartão de Crédito
                          </Typography>
                        </Box>
                      </>
                    }
                  />

                  <FormControlLabel
                    sx={{ alignItems: "baseline" }}
                    value="cartaoDeDebito"
                    name="cartao de debito"
                    {...register("formaDePagamento")}
                    control={<Radio />}
                    label={
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <CreditCardOutlinedIcon />
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            Cartão de Debito
                          </Typography>
                        </Box>
                      </>
                    }
                  />

                  <FormControlLabel
                    sx={{ alignItems: "baseline" }}
                    value="pix"
                    name="pix"
                    {...register("formaDePagamento")}
                    control={<Radio />}
                    label={
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <PixOutlinedIcon />
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            Pix
                          </Typography>
                        </Box>
                      </>
                    }
                  />

                  <FormControlLabel
                    sx={{ alignItems: "baseline" }}
                    value="Dinheiro"
                    name="Dinheiro"
                    {...register("formaDePagamento")}
                    control={<Radio />}
                    label={
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <AttachMoneyIcon />
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            Dinheiro
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </RadioGroup>
                {errors.formaDePagamento && (
                  <p className="error-message">
                    {errors.formaDePagamento.message}
                  </p>
                )}
              </Box>
            </Box>
          </Box>

          <Box className="totalPurchase">
            <Box className="contentTotalPurchase">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "75%",
                  height: "100%",
                  alignItems: "left",
                  justifyContent: "center",
                  pl: 1,
                }}
              >
                <Typography variant="h6"></Typography>
              </Box>
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
        </Box>
      </form>
    </Box>
  );
};

export default Order;
