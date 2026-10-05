import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
// Type-only dependencies allow these domain modules to run on CI's Node 20.
async function load(name) {
 const source = await readFile(new URL(`../lib/tickets/side-conversation/${name}.ts`, import.meta.url), 'utf8')
 const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
 return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { createSideConversationState, sideConversationReducer: reduce } = await load('state')
const { createAttachmentQueue } = await load('attachments')
const message = { id: 'm1', body: 'Hello', author: 'Maya', time: '9:30 AM' }
function harness() {
 let state = createSideConversationState('Ticket', { maya: [message] })
 const dispatch = action => { state = reduce(state, action) }
 return { dispatch, get state() { return state } }
}
test('overlapping attachment batches append to current draft and retain owner after switching', async () => {
 const h = harness(); const readers = new Map()
 const queue = createAttachmentQueue({
  start: personId => h.dispatch({type:'upload-started',personId}),
  complete: (personId,files) => h.dispatch({type:'attachments-added',personId,files}),
  finish: personId => h.dispatch({type:'upload-finished',personId}),
  error: (_,error) => assert.fail(error),
 }, file => new Promise(resolve => readers.set(file.name, resolve)))
 const a = queue.add('maya',[{name:'slow',size:1}]); const b = queue.add('maya',[{name:'fast',size:1}]); const c = queue.add('alex',[{name:'other',size:1}])
 readers.get('fast')({id:'fast'}); await b
 h.dispatch({type:'attachment-removed',personId:'maya',id:'fast'})
 h.dispatch({type:'message-sent',personId:'maya',message:{...message,id:'blocked'}})
 assert.equal(h.state.messages.maya.length,1)
 assert.equal(queue.isPending('maya'),true)
 readers.get('other')({id:'other'}); await c
 readers.get('slow')({id:'slow'}); await a
 assert.deepEqual(h.state.attachments.maya,[{id:'slow'}])
 assert.deepEqual(h.state.attachments.alex,[{id:'other'}])
 assert.equal(h.state.pendingUploads.maya,0)
 assert.equal(queue.isPending('maya'),false)
})
test('dispose aborts outstanding reads and ignores late completions', async () => {
 let resolveRead, signal; const events=[]
 const queue=createAttachmentQueue({start:()=>events.push('start'),complete:()=>events.push('complete'),finish:()=>events.push('finish'),error:()=>events.push('error')},(_,s)=>{signal=s;return new Promise(resolve=>{resolveRead=resolve})})
 const pending=queue.add('maya',[{name:'file',size:1}]); queue.dispose()
 assert.equal(signal.aborted,true); resolveRead({id:'late'}); await pending
 assert.deepEqual(events,['start'])
})
test('reply send clears only its own draft; reaction toggle cannot cross conversations', () => {
 const h=harness()
 for(const personId of ['maya','alex']) h.dispatch({type:'draft',personId,value:'draft'})
 h.dispatch({type:'reply',personId:'maya',value:message})
 h.dispatch({type:'reaction',personId:'alex',messageId:'m1',emoji:'👍'})
 assert.deepEqual(h.state.reactions,{})
 const react={type:'reaction',personId:'maya',messageId:'m1',emoji:'👍'}
 h.dispatch(react); h.dispatch(react); assert.deepEqual(h.state.reactions['maya:m1'],[])
 h.dispatch({type:'message-sent',personId:'maya',message:{...message,id:'reply',replyTo:message}})
 assert.equal(h.state.drafts.maya,''); assert.equal(h.state.drafts.alex,'draft')
 assert.equal(h.state.replies.maya,undefined)
 assert.equal(h.state.messages.maya.at(-1).replyTo.id,'m1')
})
test('forwarding preserves in-progress draft and reply', () => {
 const h=harness(); h.dispatch({type:'draft',personId:'maya',value:'unfinished'})
 h.dispatch({type:'reply',personId:'maya',value:message})
 h.dispatch({type:'message-forwarded',personId:'maya',message:{...message,id:'forward'},recipientName:'Maya'})
 assert.equal(h.state.drafts.maya,'unfinished'); assert.equal(h.state.replies.maya.id,'m1')
})
