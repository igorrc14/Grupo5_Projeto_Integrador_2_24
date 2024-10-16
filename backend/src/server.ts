import express from "express";
import {Request, Response, Router} from "express";
import { AccountsManager } from "./accounts/accounts";
import { FinancialManager } from "./financial/financial";

const port = 3000; 
const server = express();
const routes = Router();

// definir as rotas. 
// a rota tem um verbo/método http (GET, POST, PUT, DELETE)
routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido. Rota default não definida.');
});

routes.get('/login',AccountsManager.loginHandler, (req: Request, res: Response)=>{
    res.statusCode = 200;
    res.send('Aaadsadida.');
    AccountsManager.loginHandler
});


// vamos organizar as rotas em outro local 
// routes.put('/signUp', AccountsManager.signUpHandler);
routes.post('/login',AccountsManager.loginHandler);
routes.post('/addNewEvent', /*handler */);
routes.post('/getEvents', /*handler */);
routes.post('/deleteEvent', /*handler */);
routes.post('/evaluateNewEvent', /*handler */);
routes.post('/addFunds', /*handler */);
routes.post('/withdrawFunds', /*handler */);
routes.post('/betOnEvent', /*handler */);
routes.post('/finishEvent', /*handler */);
routes.post('/searchEvent', /*handler */);
routes.get("/teste")


server.use(routes);

server.listen(port, ()=>{
    console.log(`Server is running on: ${port}`);
})