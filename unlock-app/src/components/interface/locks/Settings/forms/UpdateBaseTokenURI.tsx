import { useMutation, useQuery } from '@tanstack/react-query'
import { Input, Button } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '@unlock-protocol/ui'
import { useProvider } from '~/hooks/useProvider'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UpdateBaseTokenURIProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  baseTokenURI: string
}

const validate = (val: string) => {
  return val.endsWith('/')
}

export const UpdateBaseTokenURI = ({
  lockAddress,
  network,
  disabled,
  isManager,
}: UpdateBaseTokenURIProps) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useProvider()
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormProps>()

  const getTokenURI = async () => {
    return await web3Service.tokenURI(
      lockAddress,
      '0' /* get base tokenURI without extra parameters o token ID*/,
      network
    )
  }

  const setBaseTokenURI = async (fields: FormProps) => {
    const walletService = await getWalletService(network)
    await walletService.setBaseTokenURI({
      lockAddress,
      baseTokenURI: fields.baseTokenURI,
    })
  }

  const setBaseTokenURIMutation = useMutation({
    mutationFn: setBaseTokenURI,
  })

  const onSetBaseTokenURI = async (fields: FormProps) => {
    const setBaseTokenURIPromise = setBaseTokenURIMutation.mutateAsync(fields)
    await ToastHelper.promise(setBaseTokenURIPromise, {
      error: 'Failed to update base token URI.',
      success: 'Base token URI successfully updated.',
      loading: 'Updating Base token URI.',
    })
  }

  const { isLoading: isLoadingTokenURI, data: baseTokenURI } = useQuery({
    queryKey: [
      'getTokenURI',
      lockAddress,
      network,
      setBaseTokenURIMutation.isSuccess,
    ],
    queryFn: getTokenURI,
  })

  useEffect(() => {
    if (baseTokenURI) {
      setValue('baseTokenURI', baseTokenURI)
    }
  }, [baseTokenURI, setValue])

  const disabledInput =
    disabled || setBaseTokenURIMutation.isPending || isLoadingTokenURI
  const isLoading = setBaseTokenURIMutation.isPending || disabledInput

  return (
    <form
      onSubmit={handleSubmit(onSetBaseTokenURI)}
      className="flex flex-col gap-6"
    >
      <div className="relative">
        <Input
          type="url"
          label="Base token URI:"
          {...register('baseTokenURI', {
            minLength: 1,
            required: true,
            validate,
          })}
          autoComplete="off"
          disabled={disabledInput}
          error={
            errors?.baseTokenURI &&
            'The base token URI must be a valid URL that ends with a final /'
          }
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={setBaseTokenURIMutation.isPending || isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
