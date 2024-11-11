import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';
dotenv.config();
import conexao from "../connection";

export namespace AccountsManager {
    
    export type conta_usuario={
        user_id: number | undefined,
        email: string,
        nome: string,
        senha: string,
        data_nasc: string
    };

    async function checkUser(user: conta_usuario): Promise<any>{
        const connection= await conexao();

        let checarConta = await connection.execute(
            `SELECT *
             FROM USUARIO
             WHERE EMAIL = :email`,
            {
                email: user.email
            }
        )
        if(checarConta && checarConta.rows && checarConta.rows.length > 0){
            return true;
        }
    }

    export async function salvarconta(ua: conta_usuario){
        const connection= await conexao();

        let cadastrocontas = await connection.execute(
            "INSERT INTO USUARIO(ID_USUARIO, EMAIL, NOME, SENHA, DATA_NASCIMENTO) VALUES(SEQ_USUARIO.NEXTVAL, :email, :nome, :senha, TO_DATE(:data_nasc, 'YYYY-MM-DD'))",
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
    
    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {
        
        const pName = req.get('name');
        const pEmail = req.get('email');
        const pSenha = req.get('senha');
        const pBirthdate = req.get('birthdate');
        
        //const idusuario = pId ? parseInt(pId, 10): undefined; //req.get pega uma string, logo é necessario converter o id para int
        
        if(pName && pEmail && pSenha && pBirthdate){
            const newAccount: conta_usuario = {
                user_id: undefined,
                email: pEmail, 
                nome: pName,
                senha: pSenha,
                data_nasc: pBirthdate
            }
            if(!await checkUser(newAccount)){
                salvarconta(newAccount);
                res.statusCode = 200; 
                res.send(`Nova conta cadastrada.`);
            }else{
                res.statusCode = 406;
                res.send("Email já cadastrado.");
            }
        }else{
            res.statusCode = 400;
            res.send("Parâmetros inválidos ou faltantes.");
        }
    }

    async function createSessionToken(email: string, senha: string): Promise<any>{
        const connection= await conexao()

        let criarToken = await connection.execute(
            `UPDATE USUARIO
                SET TOKEN_SESSAO = dbms_random.string('x', 50)
                WHERE EMAIL = :email AND SENHA = :senha`,
            {
                email: email,
                senha: senha
            }
        )
        connection.commit();
        let getToken = await connection.execute(
            `SELECT TOKEN_SESSAO 
             FROM USUARIO
             WHERE EMAIL = :email AND SENHA = :senha`,
            {
                email: email,
                senha: senha
            }
        )
        console.log(`Token de sessão gerado para usuario: ${email} | ${(getToken.rows as any)[0][0]}`);
        return (getToken.rows as any)[0][0];
    }
    
    async function login(email:string, senha:string): Promise<any> {

        const connection= await conexao()

        let accountsRows = await connection.execute(
            'SELECT * FROM USUARIO WHERE EMAIL = :email AND SENHA = :senha',
            {
                email: email,
                senha: senha
            },
            {outFormat: OracleDB.OUT_FORMAT_OBJECT}

        )
        console.dir(accountsRows.rows)
        console.log("Login info:", email, senha);
        if(accountsRows && accountsRows.rows && accountsRows.rows.length > 0){
            return accountsRows.rows;
        }else{
            return null;
        }

    }

export const loginHandler: RequestHandler = async (req:Request,res:Response)=>{
    const pEmail=req.get('email');
    const pPassword = req.get('password');

    if(pEmail && pPassword){
        const LOGIN = await login(pEmail,pPassword)
        if(LOGIN !== null){
            const token = await createSessionToken(pEmail, pPassword);
            res.statusCode = 200;
            res.send(`Login executado. Sessão: ${token}`);
        }else{
            res.statusCode = 406;
            res.send('Conta não existente ou senha/email errados.');
        }
    }
    else{
        res.statusCode = 400;
        res.send("Requição invalida. Parametros faltando.");
    }
}

export async function loginADM(email:string, senha:string) {
    const connection= await conexao()

    let accountsRows = await connection.execute(
        'SELECT * FROM MODERADOR WHERE EMAIL = :email AND SENHA = :senha',
        {
            email: email,
            senha: senha
        },
        {outFormat: OracleDB.OUT_FORMAT_OBJECT}

    )
    console.dir(accountsRows.rows)
    console.log("Login info:", email, senha);
    if(accountsRows && accountsRows.rows && accountsRows.rows.length > 0){
        return accountsRows.rows;
    }else{
        return null;
    }

}

}
