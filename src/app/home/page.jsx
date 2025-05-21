"use client";

import styles from "./Home.module.css";

import Image from "next/image";
import { Button, Card, Flex, Typography, Skeleton, Modal } from "antd";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { getSessionStorage, setSessionStorage } from "../../utils/sessionStorage.js";

const Headers = {"x-api-key": process.env.NEXT_PUBLIC_API_KEY };

export default function Home() {
  const [isloading, setIsLoading] = useState(true);
  const [estudantes, setEstudantes] = useState([]);
  const [selectedEstudante, setSelectedEstudante] = useState("");


  const [data, setData] = useState({
    nome: [],
    email: [],
    loading: true,
    current: 1,
    pageSize: 0,
  });

  const [modalInfo, setModalInfo] = useState({
    visible: false,
    estudante: null,
    nome: null,
    email: null,
    projeto_nome: null,
    loading: false,
  });

  useEffect(() => {
    const fetchEstudantes = async () => {
      try {
        const cached = getSessionStorage("estudantesData", []);
        if (cached.length > 0) {
          setData({ nome: cached, loading: false, current: 1, pageSize: 5 });
          return;
        }
        const { data: estudantes } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/estudantes`,
          { headers: Headers }
        );
        setSessionStorage("estudantesData", estudantes);
        setData({ nome: estudantes, loading: false, current: 1, pageSize: 5 });
      } catch (error) {
        console.error("Error fetching estudantes:", error);
        toast.error("Erro ao carregar estudantes");
        setData((d) => ({ ...d, loading: false }));
      }
    };
    fetchEstudantes();
  }, []);
 
const openModal = async (estudante) => {
  setModalInfo({
    visible: true,
    estudante,
    loading: true,
  })

  const cacheKey = `estudante_${estudante.id}`;
  const cached = getSessionStorage(cacheKey, null);
  if (cached) {
    setModalInfo((m) => ({ ...m, 
      estudante: cached,  
      loading: false }));
    return;
    }
    try {
   
    const { data: estudanteCompleto } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/estudantes/${estudante.id}`,
      { 
        headers: Headers 
      }
    );
  toast.success(`Estudante ${estudanteCompleto.nome} carregado com sucesso!`);
  setSessionStorage(cacheKey, estudanteCompleto);
  setModalInfo((m) => ({
    ...m,
    estudante: estudanteCompleto,
    loading: false,
    }));
    
  } catch (error) {
   toast.error(`Erro ao carregar estudante ${estudante.nome}`);
  setModalInfo((m) => ({ ...m, loading: false }));

  }

  
}
  return (
    <div className={styles.container}>
   <h2 className={styles.ContainerTitle}>Lista de Estudantes</h2>
    {data.loading ? (
      <Skeleton active />
    ) : (
      
      <Flex className={styles.cardsContainer}>
        {data.nome.map((estudante, id) => (
          <Card
          key={estudante.id}
          className={styles.card}
          hoverable
          onClick={() => openModal(estudante)}
          cover={
             <Image
          src={estudante.photo ? `/images/${estudante.photo}` : "/images/220.png"}
          alt={estudante.nome}
          className={styles.cardImage}
          width={220}
          height={220}
        />
          }
          >
        <div className={styles.cardInfo}>
        <Typography.Text strong className={styles.Nome}>{estudante.nome}</Typography.Text>
        <Typography.Text type="secondary"className={styles.Projeto} >{estudante.projeto_nome}</Typography.Text>
         </div>   
          </Card>

        ))}
      
      </Flex>
     
    )}

   <Modal
  title="Informações do Estudante"
  open={modalInfo.visible}
  onCancel={() => setModalInfo((m) => ({ ...m, visible: false }))}
  footer={[
    <Button key="cancel" onClick={() => setModalInfo((m) => ({ ...m, visible: false }))}>
      Fechar
    </Button>,
  ]}
>
  {modalInfo.loading ? (
    <Skeleton active />
  ) : modalInfo.estudante ? (
    <div>
     <p>
      <span className={styles.label}>Nome: </span>{""}
      {modalInfo.estudante.nome}
     </p>
     <p>
      <span className={styles.label}>Email: </span>{""}
      {modalInfo.estudante.email}
     </p>
     <p>
      <span className={styles.label}> Projeto: </span>{""}
      {modalInfo.estudante.projeto_nome}
     </p>
    </div>
  ) : (
    <p>Informações não encontradas.</p>
  )}
</Modal>

<ToastContainer/>
    

    </div>
  );
};


