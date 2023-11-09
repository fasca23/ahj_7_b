const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body').default;
const cors = require('@koa/cors');
const uuid = require('uuid');

const app = new Koa();
const router = new Router();

const dateNow = new Date();

const ticketsFull = [
  {
    id: 1,
    name: 'Много разной фигни сделать',
    description: 'Да, да много ....',
    status: true,
    created: dateNow,        
},
{
    id: uuid.v4(),
    name: 'Починить комп в ауд. 337',
    description: 'Пнуть техника из ауд. 125',
    status: false,
    created: dateNow,
},
{
    id: uuid.v4(),
    name: 'Запустить телевизор на главном входе',
    description: 'Выдать провод для телевизора HDMI',
    status: false,
    created: dateNow,
},
{
    id: uuid.v4(),
    name: 'Проверить расписание ауд. на Четверг',
    description: 'Или проверить чтоб техник проверил....',
    status: false,
    created: dateNow,        
}
]; 

app.use(cors());
app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

// Отдаем все заявки по запросу (GET ?method=allTickets)
router.get('/', (ctx) => {
  const params = new URLSearchParams(ctx.request.querystring);
  const { method, id } = { method: params.get("method"), id: params.get("id") };

  if (method === 'allTickets') { 
    const tickets = ticketsFull;
    // console.log(ticketsFull)

    ctx.status = 200;
    ctx.body = { tickets };
    return;
  }

  // дополнительно выдаем "Описание" по id заявки (GET ?method=ticketById&id=<id>)
  if (method === 'ticketById' && id !== null) { 
    const ticket = ticketsFull.find(el => el.id == id);
    if (!ticket) { 
      ctx.status = 400;
      ctx.body = {error: 'нет такого id заявки'};
      return;
    }
    const { description } = ticket;
    ctx.status = 200;
    ctx.body = { description };
    return;
  }

  // если нет метода
  ctx.status = 200;
  ctx.body = 'Задайте метод для правильного ответа сервера';

});

// Создаем новую заявку (POST ?method=createTicket)
router.post('/', (ctx) => {
  const { name, description, status } = ctx.request.body;
  const params = new URLSearchParams(ctx.request.querystring);
  const { method, id } = { method: params.get("method"), id: params.get("id") };

  if (method === 'createTicket' && id === null) {
    const ticketID = uuid.v4();
    const ticketDate = new Date();
    const created = {
      id: ticketID,
      name: name,
      description: description,
      status: status,
      created: ticketDate,
    }

    ticketsFull.push(created);

    ctx.status = 200;
    ctx.body = { created };
    return;
  }

  // всё остальное для POST
  ctx.status = 400;
  ctx.body = { POST: 'не найдено', };
});

// Удаляем заявку по ID (DELETE ?method=removeTicket&id=<id>)
router.delete('/', (ctx) => {
  const params = new URLSearchParams(ctx.request.querystring);
  const { method, id } = { method: params.get("method"), id: params.get("id") };

  if (method === 'removeTicket' && id !== null) {
    const ticket = ticketsFull.find(el => el.id == id);
    const index = ticketsFull.indexOf(ticket);

    if (index === '-1') {
      ctx.status = 400;
      ctx.body = {error: 'нет такого id для удаления заявки'};
      return;
    }

    const removedArr = ticketsFull.splice(index,1);
    const removed = removedArr[0];

    ctx.status = 200;
    ctx.body = { removed };
    return;
  }

  // всё остальное для DELETE
  ctx.status = 400;
  ctx.body = { DELETE: 'не найдено', };
});

// Изменяем заявку по ID (PUT ?method=ticketCompleted&id=<id>)
router.put('/', (ctx) => {
  const { name, description } = ctx.request.body;
  const params = new URLSearchParams(ctx.request.querystring);
  const { method, id } = { method: params.get("method"), id: params.get("id") };

  // изменение статуса
  if (method === 'ticketCompleted' && id !== null) { 
    const ticket = ticketsFull.find(el => el.id == id);

    if (!ticket) { 
      ctx.status = 400;
      ctx.body = {error: 'нет такого id'};
      return;
    }

    const status = ticket.status = !ticket.status;

    ctx.status = 200;
    ctx.body = { status };
    return;
  }

  // изменение статуса
  if (method === 'ticketEdit' && id !== null) { 
    const edited = ticketsFull.find(el => el.id == id);

    if (!edited) { 
      ctx.status = 400;
      ctx.body = {error: 'нет такого id'};
      return;
    }

    edited.name = name;
    edited.description = description;

    ctx.status = 200;
    ctx.body = { edited };
    return;
  }

  // всё остальное для PUT
  ctx.status = 400;
  ctx.body = { status: 'не найден', };
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = 7070;
app.listen(7070, () => {
  console.log(`Сервер запущен на порту ${port}`);
});