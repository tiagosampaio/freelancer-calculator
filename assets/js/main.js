$(function(){

    $('#valor').priceFormat({
        prefix: '',
        centsSeparator: ',',
        thousandsSeparator: '.'
    });

    $('#salario').priceFormat({
        prefix: '',
        centsSeparator: ',',
        thousandsSeparator: '.'
    });

    $('#valor-hora').priceFormat({
        prefix: '',
        centsSeparator: ',',
        thousandsSeparator: '.'
    });

    $('body').on('click', '#custos-mensais li', function (){
        var text = $(this).find("#content").text();
        var id = $(this).attr('val');
        $("#codigo").val(id);
        
        var dados = text.split('- R$');
        
        $("#custo").val(dados[0].trim());
        $("#valor").val(dados[1].trim());

        $("#custo").closest(".form-group").removeClass("is-empty");
        $("#valor").closest(".form-group").removeClass("is-empty");

        $(this).closest("#custos-mensais").children("[val!='" + id + "']").removeClass('checked');

        $("#valor").focus();

        if(!$(this).toggleClass('checked').hasClass('checked'))
        {
            $("#valor").blur();

            $("#codigo").val('');
            $("#custo").val('');
            $("#valor").val('');

            $("#custo").closest(".form-group").addClass("is-empty");
            $("#valor").closest(".form-group").addClass("is-empty");
        }
    });

    $('body').on('click', 'li .close', function (e){
        e.stopPropagation();
        var id = $(this).parent().attr('val');

        var dados = getDados();

        dados = dados.filter(d => d[0] != id);

        atualizarLista(dados);
    });

    const getDados = () =>
    {
        var data = [];

        $('#custos-mensais li').each(function(){
            var id = $(this).attr('val');
            var text = $(this).find("#content").text();
            
            var dados = text.split('- R$');
        
            data.push([id, dados[0].trim(), dados[1].trim()]);
        });

        return data;
    };

    const atualizarLista = (dados) =>
    {
        var ul = $('#custos-mensais');
        ul.empty();
        dados.forEach(function(el) {
            ul.append('<li val="' + el[0] + '"><span id="content">' + el[1].trim() + ' - R$ ' + el[2].trim() + '</span><span class="close"><i class="material-icons">clear</i></span><span class="edit"><i class="material-icons">edit</i></span></li>');
        });
    };

    $('#btn-add').click(function(e){
        e.preventDefault();
        var dados = getDados();
        var cod = $("#codigo");
        var cst = $("#custo");
        var val = $("#valor");

        var id = cod.val();
        var replace = 0;

        if(!id)
            id = dados.length + 1;
        else
            dados = dados.filter(d => d[0] != id);

        var custo = cst.val();
        var valor = val.val();

        dados.push([id, custo, valor]);

        dados.sort((a, b) => a[0] - b[0]);

        atualizarLista(dados);

        cod.val('');
        cst.val('');
        val.val('');

        cst.closest(".form-group").addClass("is-empty");
        val.closest(".form-group").addClass("is-empty");
    });

    const formatarValorParaDecimal = (valor) => {
        if(valor && valor.length > 0)
            return valor.replace(".", "").replace(",", ".");
        else
            return 0
    };

    const formatResult = (valor) =>
    {
        var str = String(parseFloat(valor || 0).toFixed(2));

        str = str.replace(".", "");

        var valor = []

        str.split('').reverse().forEach((item, index) =>
        {
            valor.push(item);
            if(index == 1)
                valor.push(',');
            else if((index + 2) % 3 == 0)
                valor.push('.');
        });

        var result = valor.reverse().join('');
        result = result.replace(/^\./, '');
        
        return result;
    }

    const horaTecnica = () =>
    {
        var salario = parseFloat(formatarValorParaDecimal($("#salario").val() || 0));
        var horas = parseFloat($("#horas").val() || 0);
        var dias = parseFloat($("#dias").val() || 0);
        var semanas = parseFloat($("#semanas").val() || 0);

        var dados = getDados();

        custo_mensais = dados
                        .map(d => d[2])
                        .reduce((acc, cur) => acc + parseFloat(formatarValorParaDecimal(cur)), 0);

        var result = (((salario+custo_mensais)/(horas*dias*4))+((salario/4*semanas)/((horas*dias*48)-(semanas*dias*horas))))*110/100;
        
        return formatResult(result);
    };

    $('.wizard-card').on("last-tab", function() {
        var hora = horaTecnica();
        $('#valor-hora').val(hora);
        $("#valor-hora").closest(".form-group").removeClass("is-empty");

        var horas = $("#horas").val();
        if(horas){
            $("#horas-projeto").val(horas);
            $("#horas-projeto").closest(".form-group").removeClass("is-empty");
        }

        valorJob();
    });

    $('.wizard-card').on("penultimate-tab", function() {
        var hora = horaTecnica();

        $('.hora-tecnica').html(hora);
    });

    const calcularValorJob = () =>
    {
        var valorHora = parseFloat(formatarValorParaDecimal($("#valor-hora").val() || 0));
        var horasProjeto = parseFloat($("#horas-projeto").val() || 1);
        var diasProjeto = parseFloat($("#dias-projeto").val() || 1);

        var valorJob = valorHora * (horasProjeto * diasProjeto);
        
        return formatResult(valorJob);
    };

    const valorJob = () =>
    {
        var valor = calcularValorJob();

        $('.valor-job').html(valor);
    };

    $("#valor-hora").on('input', () => valorJob());

    $("#horas-projeto").on('input', () => valorJob());

    $("#dias-projeto").on('input', () => valorJob());
});