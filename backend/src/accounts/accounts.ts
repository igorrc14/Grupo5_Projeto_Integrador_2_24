import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';
dotenv.config();
import conexao from "../connection";

/*
    Nampespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsManager {
    
    export type conta_usuario={
        user_id: number | undefined,
        email: string,
        nome: string,
        senha: string,
        data_nasc: string
    };

    export async function salvarconta(ua: conta_usuario){
        console.log("CHEGOOUUU")

        const connection= await conexao()
        console.log("ebaaa")

        let cadastrocontas = await connection.execute(
            "INSERT INTO USUARIO(ID_USUARIO, EMAIL,NOME, SENHA,DATA_NASCIMENTO) VALUES(SEQ_ACCOUNTS.NEXTVAL, :email, :nome, :senha, TO_DATE(:data_nasc, 'YYYY-MM-DD'))",
            {
                
                email: ua.email,
                nome: ua.nome,
                senha: ua.senha,
                data_nasc: ua.data_nasc
            },
        )
        connection.commit()
        console.log("Conta cadastrada. ", cadastrocontas);
    }
    
    export const signUpHandler: RequestHandler = (req: Request, res: Response) => {
        // Passo 1 - Receber os parametros para criar a conta
        
        const pName = req.get('name');
        const pEmail = req.get('email');
        const pSenha = req.get('senha');
        const pBirthdate = req.get('birthdate');
        
        //const idusuario = pId ? parseInt(pId, 10): undefined; //req.get pega uma string, logo é necessario converter o id para int
        
        if(pName && pEmail && pSenha && pBirthdate){
            // prosseguir com o cadastro... 
            const newAccount: conta_usuario = {
                user_id: undefined,
                email: pEmail, 
                nome: pName,
                senha: pSenha,
                data_nasc: pBirthdate
            }
            salvarconta(newAccount);
            res.statusCode = 200; 
            res.send(`Nova conta cadastrada.`);
        }else{
            res.statusCode = 400;
            res.send("Parâmetros inválidos ou faltantes.");
        }
    }

    async function login(email:string, senha:string) {
        //Ajustando a saida para objetos JS.
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        const connection= await conexao()

        let accountsRows = await connection.execute(
            'SELECT * FROM USUARIO WHERE EMAIL = :email AND SENHA = :senha',
            [email,senha]

        )
    //imprimindo o que veio do oracle
    console.dir(accountsRows.rows)
    console.log(email, senha);

    }
export const loginHandler: RequestHandler = async (req:Request,res:Response)=>{
    //obtendo os parametros queestao no header da requissição (req)
    const pEmail=req.get('email');
    const pPassword = req.get('senha');

    // se as constantes pEmail e pPassword estão definidas (diferentes de undefined)
    //faz o login...
    if(pEmail && pPassword){
        login(pEmail,pPassword)
        //depois vamos complementar a resposta correta...
        //resposta temporaria
        res.statusCode = 200;
        res.send('função login executada...')
    }
    else{
        res.statusCode = 400;
        res.send("Requição invalida. Parametros faltando.")
    }
}

}
