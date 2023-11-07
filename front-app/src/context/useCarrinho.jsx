/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "../Firebase/firebase";

const CarrinhoContext = createContext();

export function useCarrinho() {
  return useContext(CarrinhoContext);
}

// eslint-disable-next-line react/prop-types
export function CarrinhoProvider({ children }) {
  const db = getFirestore(app);
  const userId = useState(null);
  const [cart, setCart] = useState([]);
  const [tempProducts, setTempProducts] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const saveUserData = async (data) => {
    try {
      if (!orderNumber) {
        orderNumber = generateUniqueOrderNumber();
      }
      const DadosPessoais = {
        nome: data.nome,
        telefone: data.telefone,
        endereco: {
          cep: data.cep,
          rua: data.rua,
          casaApto: data.casaApto,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
        },
      };

      if (userId) {
        const orderPath = `Tests/TELEFONE/PEDIDOS/${orderNumber}`;
        const orderDocRef = doc(db, orderPath);
        await setDoc(orderDocRef, {
          DadosPessoais,
          itens: tempProducts,
          dataPedido: new Date(),
        });
      } else {
        const generalOrderPath = `Tests/TELEFONE/PEDIDOS/${orderNumber}`;
        const generalOrderDocRef = doc(db, generalOrderPath);
        await setDoc(generalOrderDocRef, {
          DadosPessoais,
          itens: tempProducts,
          dataPedido: new Date(),
        });
      }

      setTempProducts([]);
      return userId;

    } catch (error) {
      console.error("Erro ao enviar o pedido: ", error);
    }
  };

  const saveCartToSessionStorage = (cart) => {
    sessionStorage.setItem("itensSelecionados", JSON.stringify(cart));
  };

  const isSameCartItem = (item1, item2) => {
    if (!item1 || !item2) {
      return false;
    }
    return (
      item1.id === item2.id &&
      item1.opicionais === item2.opicionais &&
      item1.refrigeranteDoCombo === item2.refrigeranteDoCombo &&
      item1.observacao === item2.observacao &&
      item1.valor === item2.valor &&
      areAdditionalsSame(item1.adicionais, item2.adicionais)
    );
  };

  const areAdditionalsSame = (additionals1, additionals2) => {
    if (!additionals1 || !additionals2) {
      return false;
    }

    if (additionals1.length !== additionals2.length) {
      return false;
    }

    for (let i = 0; i < additionals1.length; i++) {
      if (
        additionals1[i].name !== additionals2[i].name ||
        additionals1[i].qtde !== additionals2[i].qtde
      ) {
        return false;
      }
    }

    return true;
  };

  const addToCart = (item) => {
    if (isAlertOpen) {
      let updatedCart = [...cart];
      let itemExists = false;

      if (orderNumber === null) {
        orderNumber = generateUniqueOrderNumber();
      }

      updatedCart = updatedCart.map((cartItem) => {
        if (isSameCartItem(cartItem, item)) {
          itemExists = true;
          return {
            ...cartItem,
            quantidade: cartItem.quantidade + 1,
          };
        }
        return cartItem;
      });

      if (!itemExists) {
        updatedCart.push({
          ...item,
          quantidade: 1,
          numeroPedido: orderNumber,
        });
      }

      setCart(updatedCart);
      saveCartToSessionStorage(updatedCart);
      setTempProducts((prevProducts) => [...prevProducts, item]);
    } else {
      console.log(
        "Não é possível adicionar itens ao carrinho, o estabelecimento está fechado."
      );
    }
  };

  function generateUniqueOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const orderNumber = `${year}${month}${day}${hours}${minutes}${seconds}`;

    return orderNumber;
  }
  let orderNumber = generateUniqueOrderNumber();

  const sendOrder = async () => {
    if (tempProducts.length > 0) {
      try {
        setTempProducts([]);
        console.log("Pedido enviado com sucesso.");
      } catch (error) {
        console.error("Erro ao enviar o pedido: ", error);
      }
    }

    clearCart();
  };

  const removeQuantityFromCart = (itemId) => {
    const updatedCart = cart.map((item) => {
      if (item.id === itemId.id && item.quantidade > 1) {
        return { ...item, quantidade: item.quantidade - 1 };
      }

      return item;
    });

    setCart(updatedCart);
    saveCartToSessionStorage(updatedCart);
  };

  const deleteFromCart = (item) => {
    const updatedCart = cart.filter(
      (itemCart) => JSON.stringify(itemCart) !== JSON.stringify(item)
    );
    setCart(updatedCart);
    saveCartToSessionStorage(updatedCart);
  };

  const calculateSubtotal = (cart) => {
    let subtotal = 0;

    cart?.map((item) => {
      const qtd = item.quantidade;
      let valorAdicionais = 0;

      if (item.adicionais && item.adicionais.length > 0) {
        valorAdicionais = item.adicionais.reduce((total, adicional) => {
          return total + adicional.valor * adicional.qtde;
        }, 0);
      }

      if (qtd > 0) {
        const valorTotalItem =
          (item.valor + valorAdicionais + item.valorSelecionado) * qtd;
        subtotal += valorTotalItem;
      }
    });

    return subtotal;
  };

  const clearCart = () => {
    setCart([]);

    sessionStorage.removeItem("itensSelecionados");
  };

  const openingHours = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const openingTime = 0;
    const closingTime = 23;

    if (
      (currentHour > openingTime ||
        (currentHour === openingTime && currentMinute >= 0)) &&
      (currentHour < closingTime ||
        (currentHour === closingTime && currentMinute <= 59))
    ) {
      setIsAlertOpen(true);
    } else {
      setIsAlertOpen(false);
    }
  };

  const handleCloseAlert = () => {
    setIsAlertOpen(false);
  };
  useEffect(() => {
    openingHours();
  }, []);

  return (
    <CarrinhoContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        openingHours,
        handleCloseAlert,
        saveUserData,
        isAlertOpen,
        userId,
        sendOrder,
        db,
        setIsAlertOpen,
        clearCart,
        deleteFromCart,
        removeQuantityFromCart,
        calculateSubtotal,
        isSameCartItem,
        saveCartToSessionStorage,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}
