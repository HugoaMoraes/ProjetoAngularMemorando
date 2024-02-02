import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TarefaService } from 'src/app/service/tarefa.service';
import { Tarefa } from '../interface/tarefa';
import {
  checkButtonTrigger,
  filterTrigger,
  formButtonTrigger,
  highlightedStateTrigger,
  listStateTrigger,
  shakeTrigger,
  shownStateTrigger,
} from '../animations';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-lista-tarefas',
  templateUrl: './lista-tarefas.component.html',
  styleUrls: ['./lista-tarefas.component.css'],
  animations: [
    highlightedStateTrigger,
    shownStateTrigger,
    checkButtonTrigger,
    filterTrigger,
    formButtonTrigger,
    shakeTrigger,
    listStateTrigger,
  ],
})
export class ListaTarefasComponent implements OnInit {
  listaTarefas: Tarefa[] = [];
  formAberto: boolean = false;
  categoria: string = '';
  validado: boolean = false;
  indexTarefa: number = -1;
  id: number = 0;
  campoBusca = '';
  tarefasFiltradas: Tarefa[] = [];
  tarefasSubscription: Subscription = new Subscription();
  estadoBotao: string = 'unchecked';

  formulario: FormGroup = this.fomBuilder.group({
    id: [0],
    descricao: ['', Validators.required],
    statusFinalizado: [false, Validators.required],
    categoria: ['', Validators.required],
    prioridade: ['', Validators.required],
  });

  constructor(
    private service: TarefaService,
    private fomBuilder: FormBuilder,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.service.listar();
    this.tarefasSubscription = this.service.tarefas$.subscribe((tarefas) => {
      this.listaTarefas = tarefas;
      this.tarefasFiltradas = tarefas;
    });
  }

  filtrarTarefasPorDescricao(descricao: string) {
    this.campoBusca = descricao.trim().toLowerCase();
    if (descricao) {
      this.tarefasFiltradas = this.listaTarefas.filter((tarefa) =>
        tarefa.descricao.toLowerCase().includes(this.campoBusca)
      );
    } else {
      this.tarefasFiltradas = this.listaTarefas;
    }
  }

  mostrarOuEsconderFormulario() {
    this.formAberto = !this.formAberto;
    this.resetarFormulario();
  }

  salvarTarefa() {
    if (this.formulario.value.id) {
      this.editarTarefa();
      setTimeout(() => {
        this.ngZone.run(() => {
          window.location.reload();
        });
      }, 1000);
    } else {
      this.criarTarefa();
      setTimeout(() => {
        this.ngZone.run(() => {
          window.location.reload();
        });
      }, 1000);
    }
  }

  criarTarefa(): void {
    if (this.formulario.valid) {
      const novaTarefa: Tarefa = this.formulario.value;
      this.service.criar(novaTarefa);
      this.resetarFormulario();
    }
  }

  editarTarefa(): void {
    if (this.formulario.valid) {
      const tarefaEditada: Tarefa = this.formulario.value;
      this.service.editar(tarefaEditada, true);
      setTimeout(() => {
        this.ngZone.run(() => {
          window.location.reload();
        });
      }, 1000);
    }
    this.resetarFormulario();
  }

  excluirTarefa(id: number): void {
    if (id) {
      this.service.excluir(id);
      setTimeout(() => {
        this.ngZone.run(() => {
          window.location.reload();
        });
      }, 1000);
    }
  }

  cancelar() {
    this.resetarFormulario();
    this.formAberto = false;
  }

  resetarFormulario() {
    this.formulario.reset({
      descricao: '',
      statusFinalizado: false,
      categoria: '',
      prioridade: '',
    });
  }

  carregarParaEditar(id: number) {
    this.service.buscarPorId(id!).subscribe((tarefa) => {
      this.formulario = this.fomBuilder.group({
        id: [tarefa.id],
        descricao: [tarefa.descricao],
        categoria: [tarefa.categoria],
        statusFinalizado: [tarefa.statusFinalizado],
        prioridade: [tarefa.prioridade],
      });
    });
    this.formAberto = true;
  }

  finalizarTarefa(tarefa: Tarefa) {
    this.id = tarefa.id;
    this.service.atualizarStatusTarefa(tarefa);
    if (tarefa.statusFinalizado == true) {
      this.estadoBotao = 'checked';
    } else {
      this.estadoBotao = 'unchecked';
    }
  }

  habilitarBotao(): string {
    if (this.formulario.valid) {
      return 'botao-salvar';
    } else return 'botao-desabilitado';
  }

  campoValidado(campoAtual: string): string {
    if (
      this.formulario.get(campoAtual)?.errors &&
      this.formulario.get(campoAtual)?.touched
    ) {
      this.validado = false;
      return 'form-tarefa input-invalido';
    } else {
      this.validado = true;
      return 'form-tarefa';
    }
  }
}
